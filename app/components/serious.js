import React, { useState, useCallback, useEffect, Component } from 'react'
import { StyleSheet, Text, View, Image} from 'react-native';
import { AppLoading } from 'expo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'


let customFonts  = {
  'Avenir': require('../assets/fonts/Avenir.ttf'),
  'Futura': require('../assets/fonts/Futura.ttf'),
};


const BOT_USER = {
  _id: 2,
  name: 'ShareBear',
  avatar: require('../assets/images/bear.png')
};

export default class Serious extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hey there! I'm ShareBear.\nWhat's up?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ],
    fontsLoaded: false,
  };

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
  }

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

  

  handleGoogleResponse(result) {
    let text = result[0].title;
    this.sendBotResponse(text);
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let message = messages[0].text;

    fetch('https://reactnative.dev/movies.json')
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.movies });
        this.handleGoogleResponse(json.movies),
        console.log(this.state.data);
      })
   
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
        <Text style={styles.modeSelect}onPress={()=>this.props.navigation.navigate('Chat')}>Sarcastic</Text>
        <Image source={require('../assets/images/header.png')} style={styles.header}></Image>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
          renderBubble={this.renderBubble}
          timeTextStyle={{ left: { color: '#fff' },right: { color:'#fff'} }}
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
    fontFamily: 'Futura',
  },
  header:{
    height:'35%',
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:'-15%',
  },
  mode:{
    height:'35%',
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:'-5%',
  },
  modeSelect:{
    fontSize:30,
    position:'absolute',
    top:'10%',
    left:'15%',
    zIndex:3,
    color:'transparent',
  },
  
});

