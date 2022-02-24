import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons'; 
import { theme } from './color';

const STORAGE_KEY = "@toDos";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  
  useEffect(()=>{
    loadToDos();
  }, [])

  const travel = ()=> setWorking(false);
  const work = ()=> setWorking(true);
  const onChangeText = (payload)=> setText(payload);
  const saveToDos = async (toSave)=> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      // saving error
    }
  }
  const loadToDos = async ()=>{
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if(s){
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      // saving error
    }
  }  
  const addToDo = async ()=> {
    if(text === ""){
      return;
    }
    //const newToDos = Object.assign({}, toDos, {[Date.now()]: {text, work:working}});
    const newToDos = {...toDos, [Date.now()]: {text, working}};
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }

  const deleteToDo = async (key)=>{
    if(Platform.OS === "web"){
      const ok = confirm("Do you want to delete this To Do?");
      if(ok){
        const newToDos= {...toDos}
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    }else{
      Alert.alert(
        'Delete To Do', 
        'Are you Sure?', 
        [
        {text: 'Cancel', style: 'cancel'},
        { text: 'OK', onPress: async () => {
          const newToDos= {...toDos}
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        } }
      ]);
    }
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white" : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput 
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value = {text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"} 
          style={styles.input}/>
      </View>
      <ScrollView>
        {
          Object.keys(toDos).map(key=>
            toDos[key].working === working ? 
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={()=>deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.toDoBg} />
              </TouchableOpacity>              
            </View> : null)
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal:20,
  },
  header: {
    flexDirection:"row",
    marginTop:100,
    justifyContent:"space-between",
  },
  btnText:{    
    fontSize : 38,
    fontWeight:"600",
    color:"white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius : 30,
    marginVertical: 20,
    fontSize : 18,
  },
  toDo:{
    backgroundColor:theme.grey,
    marginBottom :10, 
    paddingVertical: 20,
    paddingHorizontal:20, 
    borderRadius :15, 
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between"
  },
  toDoText:{
    color: "white",
    fontSize : 16, 
    fontWeight: "500", 
  },
});