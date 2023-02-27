import React from 'react';
import { withTheme, withTaskContext } from '@twilio/flex-ui';
import SecurityQuestions from './SecurityQuestions';
import { Label, Value, Header, HeaderLine } from './Common.Styles';
import {
  CustomCRMContainer,
  ProfileCanvas,
  ProfilePhoto,
  ProfileGrid,
  LargeCaption
} from './CustomCRM.Styles';

// OwlCRM URL for loading profile images
const CRM_baseurl = 'https://owlcrm-4339-dev.twil.io';

function CustomCRM(props) {
  const { task, manager } = props;

  // build visual representation of the customer profile data
  let profileDetails;
  if (task && task.attributes && task.attributes.account_data) {
    profileDetails = (
      <ProfileGrid>
        {task.attributes.account_data.service_level && (
          <div>
            <Label>Service Level</Label>
            <Value>{task.attributes.account_data.service_level}</Value>
          </div>
        )}
        {task.attributes.account_data.account_balance && (
          <div>
            <Label>Account Balance</Label>
            <Value>{task.attributes.account_data.account_balance}</Value>
          </div>
        )}
        {task.attributes.account_data.address && (
          <div>
            <Label>Address</Label>
            <Value>
              {task.attributes.account_data.address}
              <br />
              {task.attributes.account_data.city},&nbsp;
              {task.attributes.account_data.state},&nbsp;
              {task.attributes.account_data.zip}
            </Value>
          </div>
        )}
        {task.attributes.account_data.birthday && (
          <div>
            <Label>Date of Birth</Label>
            <Value>{task.attributes.account_data.birthday}</Value>
          </div>
        )}
      </ProfileGrid>
    );
  }

  // build the CRM content based on whether a Task is selected and whether
  // it contains a customer profile
  let content;
  if (!task || !task.attributes) {
    // no task is selected
    content = (
      <ProfileCanvas>
        <HeaderLine>
          <Header>
            <span>Custom CRM</span>
          </Header>
        </HeaderLine>
        <LargeCaption>No task selected</LargeCaption>
      </ProfileCanvas>
    );
  } else if (!task.attributes.account_data) {
    // task is selected, but doesn't contain profile data from CRM
    content = (
      <ProfileCanvas>
        <HeaderLine>
          <Header>
            <span>Custom CRM</span>
          </Header>
        </HeaderLine>
        <LargeCaption>No customer data found</LargeCaption>
      </ProfileCanvas>
    );
  } else {
    // task is selected and profile data are present
    content = (
      <ProfileCanvas>
        <ProfilePhoto
          alt=""
          src={CRM_baseurl + task.attributes.account_data.img_src}
        ></ProfilePhoto>
        <HeaderLine>
          <Header>
            <Value>Customer Profile</Value>
          </Header>
        </HeaderLine>
        <LargeCaption>
          {task.attributes.account_data.first_name +
            ' ' +
            task.attributes.account_data.last_name}
        </LargeCaption>
        {profileDetails}
        <SecurityQuestions manager={manager} />
      </ProfileCanvas>
    );
  }

  return <CustomCRMContainer>{content}</CustomCRMContainer>;
}

export default withTaskContext(withTheme(CustomCRM));
