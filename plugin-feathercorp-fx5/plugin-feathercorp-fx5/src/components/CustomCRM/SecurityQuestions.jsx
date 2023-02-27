import React from 'react';
import { withTheme, withTaskContext } from '@twilio/flex-ui';
import {
  SqContainer,
  SqGrid,
  SqButton,
  SqQuestion
} from './SecurityQuestions.Styles';
import { Value, Header, HeaderLine } from './Common.Styles';

class SecurityQuestions extends React.Component {
  constructor(props) {
    super(props);
    // check if agent is authorized and hide this component if not
    // (this is merely a convenience measure, not a security one as
    // the proxy function handles the access control)
    this.authorized =
      this.props.manager.user.roles.includes('supervisor') ||
      // include any specific users you want to allow (e.g. for testing)
      this.props.manager.user.identity === 'wesley_2Enascimento';

    this.state = {
      questions: undefined
    };

    // bind `this` so that it can be used from inside getSecQuestions()
    this.getSecQuestions = this.getSecQuestions.bind(this);
  }

  componentDidUpdate(prevProps) {
    // if another task has been selected, clear security questions
    if (this.props.task !== prevProps.task) {
      this.setState({ questions: undefined });
    }
  }

  // retrieve security questions using the Twilio function as a proxy
  getSecQuestions() {
    this.setState({ questions: 'Loading...' });
    // first, test if account number is provided via Task attributes
    if (
      !(
        this.props.task &&
        this.props.task.attributes &&
        this.props.task.attributes.account_number
      )
    ) {
      this.setState({ questions: 'Error: Account number not found' });
    } else {
      // if there is an account number, fetch the security questions
      // (we're using POST to avoid passing the token as a query param)
      fetch('https://fx5-proxy-function-2720-dev.twil.io/crm-proxy', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          id: this.props.task.attributes.account_number /* the account number from the task attributes */,
          token: this.props.manager.user.token /* the user's jwt token */
        })
      })
        .then(async (response) => {
          if (response.ok) {
            return response.json();
          } else {
            // throw an error if we received any error from the Function
            console.error(response);
            if (response.status && response.body) {
              throw new Error(
                `Proxy function returned "${await response.text()}"`
              );
            } else {
              throw new Error("Couldn't fetch questions from CRM");
            }
          }
        })
        .then((questions) => {
          // save fetched questions in component's state
          this.setState({ questions: questions.security_questions });
        })
        // handle errors from the Function or thrown during the fetch
        .catch((error) => {
          console.error('Fetch of security questions failed:', error);
          this.setState({
            questions: error.toString()
          });
        });
    }
  }

  render() {
    // display explanation for unauthorized users
    if (!this.authorized)
      return (
        <SqContainer style={{ opacity: '0.5' }}>
          Agent not authorized to access security questions
        </SqContainer>
      );

    const header = (
      <HeaderLine>
        <Header>
          <Value>Security Questions</Value>
        </Header>
      </HeaderLine>
    );
    switch (typeof this.state.questions) {
      // by default, show the 'Show' button
      case 'undefined':
        return (
          <SqContainer>
            {header}
            <SqButton onClick={this.getSecQuestions}>Show</SqButton>
          </SqContainer>
        );
      // if we encountered any error during the fetch, show it to the user
      case 'string':
        return (
          <SqContainer>
            {header}
            <Value>{this.state.questions}</Value>
          </SqContainer>
        );
      // otherwise render the security questions
      default:
        return (
          <SqContainer>
            {header}
            <SqGrid>
              {this.state.questions.q1 && this.state.questions.a1 && (
                <div>
                  <SqQuestion>{this.state.questions.q1}</SqQuestion>
                  <Value>{this.state.questions.a1}</Value>
                </div>
              )}
              {this.state.questions.q2 && this.state.questions.a2 && (
                <div>
                  <SqQuestion>{this.state.questions.q2}</SqQuestion>
                  <Value>{this.state.questions.a2}</Value>
                </div>
              )}
            </SqGrid>
          </SqContainer>
        );
    }
  }
}

export default withTaskContext(withTheme(SecurityQuestions));
