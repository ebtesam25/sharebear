import React, { useState, useCallback, useEffect, Component } from 'react'
import { StyleSheet, Text, View, Image, Button} from 'react-native';

import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from '../env';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';



const BOT_USER = {
  _id: 2,
  name: 'ShareBear',
  avatar: require('../assets/images/bear.png')
};

export default class Serious extends Component {
  state = {
    image: null,
    messages: [
      {
        _id: 1,
        text: `Hey there! I'm ShareBear.\nWhat's up?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ],
  
  };

  
  componentDidMount() {
    
    this.getPermissionAsync();
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permission to make this work!');
      }
    }
  };

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  renderSend(props) {
    return (
        <Send
            {...props}
        >
            <View style={{marginRight: 10, marginBottom: 5}}>
                <Image source={require('../assets/images/send.png')} />
            </View>
        </Send>
    );
};


  renderBubble(props) {
    return (
      // Step 3: return the component
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            // Here is the color change
            backgroundColor: '#FE7686'
          },
          left: {
            backgroundColor: '#c289b4'
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: '#fff'
          }
        }}
      />
    );
  };

  

  handleGoogleResponse(req,result) {
        
    
    if(req.includes("weather")){
        var i=0;
        let text = [];
    for(i=0;i<result.length;i++){
        text.push("\n\n"+(i+1)+". "+result[i].name+"\nDescription: "+result[i].description+"\nCategory: "+result[i].category+"\nStatus: "+result[i].status+"\nType: "+result[i].type);
    }
            
    this.sendBotResponse(text);
    }
    else{
        console.log(result);
        let text = result.queryResult.fulfillmentMessages[0].text.text[0];
        this.sendBotResponse(text);
    }
    
  }
  

  onSend(messages = [], image) {
    image=this.state.image;
    console.log(this.state.image);
    const msg = {
      ...messages[0],
      image
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, msg)
    }));

    let message = messages[0].text;
    console.log(message);
    var test = message;
    
    if(test.includes("Civic")){

    console.log("CIVIC");
    fetch('https://us-central1-aiot-fit-xlab.cloudfunctions.net/getcivicissues')
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.issues });
        console.log(json.issues);
        this.handleGoogleResponse(test,json.issues),
        console.log(this.state.data);
      })
    }
    else{
        Dialogflow_V2.requestQuery(
            message,
            result => this.handleGoogleResponse(test,result),
            error => console.log(error)
          );
      
    }
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  render() {
    
    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/serious.png')} style={styles.mode}></Image>
        <Text style={styles.modeSelect} onPress={()=>this.props.navigation.navigate('Chat')}>Serious</Text>
        <Image source={require('../assets/images/header.png')} style={styles.header}></Image>
        <Image source={require('../assets/images/image.png')} style={styles.image}></Image>
        <Text onPress={this._pickImage} style={{position:'absolute',zIndex:6,bottom:10,right:50, fontSize:20, color:'transparent'}} >"PICK"</Text>
        <GiftedChat
          
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
          renderBubble={this.renderBubble}
          isTyping
          alwaysShowSend 
          renderSend={this.renderSend}
          infiniteScroll 
          loadEarlier
        />
      </View>
    );
  
  }
}


const styles = StyleSheet.create({
  container: {
    height:'100%',
    position:'relative',
    backgroundColor: '#FFF4F4',
    
  },
  header:{
    height:200,
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:-70,
    zIndex:2,
  },
  mode:{
    
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:40,
    zIndex:2,
  },
  modeSelect:{
    fontSize:30,
    position:'absolute',
    top:'11%',
    left:'15%',
    zIndex:4,
    color:'transparent',
  },
  image:{
    
    resizeMode: 'contain',
    position:'absolute',
    bottom:6,
    right:50,
    zIndex:5,
  }
  
});

