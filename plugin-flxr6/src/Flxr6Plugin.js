import React from 'react';
import { VERSION, View } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import CustomTaskListContainer from './components/CustomTaskList/CustomTaskList.Container';
import reducers, { namespace } from './states';
// import components for news view
import NewsNavButton from './components/NewsNavButtonComponent';
import NewsView from './components/NewsViewComponent';
// Notifications Framework, add custom notification component
import FlexTipNotification from './components/FlexTipNotificationComponent';

const PLUGIN_NAME = 'Flxr6Plugin';

export default class Flxr6Plugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);

    const options = { sortOrder: -1 };
    flex.AgentDesktopView.Panel1.Content.add(<CustomTaskListContainer key="Flxr6Plugin-component" />, options);
    // Add news button component to the SideNav
   flex.SideNav.Content.add(
    <NewsNavButton key="news-sidenav-button" />
  );

  // Add news view to the ViewCollection
  flex.ViewCollection.Content.add(
    <View name="news-view" key="news-view">
      <NewsView key="co-news-view" />
    </View>
  );
  // Template strings: 1-line changes
  manager.strings.NoTasksTitle = "Awaiting incoming requests...";
  manager.strings.TaskLineCallReserved = "Call from {{task.attributes.caller_city}} number"
     // Template strings: TaskInfoPanelContent
     manager.strings.TaskInfoPanelContent = `
     <h1>CUSTOMER DETAILS</h1>   
     <h2>Phone Number: Locale</h2>
     <p>{{task.attributes.caller_city}}, {{task.attributes.caller_state}} {{task.attributes.caller_zip}}</p>
     ​
     <h2>Phone Number: Country</h2>
     <p>{{task.attributes.caller_country}}</p>
 
     <h2>Workflow</h2>
     <p>{{task.workflowName}}</p>
 
     <hr />
     <h1>TASK CONTEXT</h1>
     <h2>Task created on</h2>
     <p>{{task.dateCreated}}</p>
 
     <h2>Task priority</h2>
     <p>{{task.priority}}</p>
 
     <h2>Task type</h2>
     <p>{{task.taskChannelUniqueName}}</p>    
     `; 
        // Actions Framework - Auto-accept chat plugin
   manager.workerClient.on("reservationCreated", reservation => {
    if (reservation.task.taskChannelUniqueName === 'chat') {
      flex.Actions.invokeAction("AcceptTask", {sid: reservation.sid });
      flex.Actions.invokeAction("SelectTask", {sid: reservation.sid});   
    }
  });  
   // Using Notifications Framework for custom notification
     // define an array of Flex User Tips
     let flexTips = [
      "Did you know? You can perform a Cold Transfer: 1) Push the arrow button at the bottom of the call pane when in mid-call 2) Select the person or queue for transfer, 3) Click the arrow button for that target.",
      "Did you know? You can perform a Warm Transfer: 1) Push the arrow button at the bottom of the call pane when in mid-call 2) Select the person or queue for transfer, 3) Click the phone button for that target and confirm the details of the transfer, 4) Click the arrow to complete the transfer.",
      "Did you know? After the conversation with your customer is ended, you can wrap up your related work before hitting the Complete button to mark the transaction as finished.",
      "Have some spare time between customers? Check out our company News Page with the last button in the navigation bar."
    ];

    // select a random tip
    let randomTip =
    flexTips[Math.floor(Math.random() * flexTips.length)];

    // register a custom notification
    flex.Notifications.registerNotification({
      id: "FlexUserTip",
      type: flex.NotificationType.information,       
      backgroundColor: 'rgb(236, 237, 241)',
      timeout: 8000,

      // v1 Notifications string content
      content: randomTip      
    });

    // dispatch the notification
    flex.Notifications.showNotification("FlexUserTip", null);
    // register a custom notification
    flex.Notifications.registerNotification({
      id: "FlexUserTip",
      type: flex.NotificationType.information,       
      backgroundColor: 'rgb(236, 237, 241)',
      timeout: 8000,
  
      // v1 Notifications string content
      // content: randomTip
  
      // v2 content with styled custom notification
      content: <FlexTipNotification header="Flex Tips" message={randomTip} />
      });
  
      // dispatch the notification
      flex.Notifications.showNotification("FlexUserTip", null);
      // Modify default notification for TransferFailed event
     const notification = flex.Notifications.registeredNotifications.get("TransferFailed");
     notification.content = "Transfer to agent has failed";
 }; // end init()
  

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
