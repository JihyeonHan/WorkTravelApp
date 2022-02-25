import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fontisto, Feather } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {theme} from './color';

const STORAGE_KEY = "@toDos";
const STORAGE_WORKING_KEY = "@working";
export default function App() {
    const [working, setWorking] = useState(true);
    const [editKey, setEditKey] = useState(false);
    const [finished, setFinished] = useState(false);
    const [text, setText] = useState("");
    const [toDos, setToDos] = useState({});

    useEffect(() => {
        loadToDos();
    }, [])

    const travel = () => {
        setWorking(false);
        saveWorking(false);
    }
    const work = () => {
        setWorking(true);
        saveWorking(true);
    }
    const onChangeText = (payload) => setText(payload);
    const saveWorking = async (working) => {
        try {
            await AsyncStorage.setItem(STORAGE_WORKING_KEY, working? "work" : "travel")
        } catch (e) {
            // saving error
        }
    }
    const saveToDos = async (toSave) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        } catch (e) {
            // saving error
        }
    }
    const loadToDos = async () => {
        try {
            const s = await AsyncStorage.getItem(STORAGE_KEY);
            if (s) {
                setToDos(JSON.parse(s));
            }
            const w = await AsyncStorage.getItem(STORAGE_WORKING_KEY);
            if (w) {
                setWorking(w === 'work' ? true:false);
            }
        } catch (e) {
            // saving error
        }
    }
    const addToDo = async () => {
        if (text === "") {
            return;
        }
        const editing = false;
        const finished = false;
        //const newToDos = Object.assign({}, toDos, {[Date.now()]: {text, work:working}});
        const newToDos = {...toDos, [Date.now()]: {text, working, editing, finished}};
        setToDos(newToDos);
        await saveToDos(newToDos);
        setText("");
    }
    const submitToDoText = async () => {
        /*console.log('aefaefaefaef : '+text);
        if (text === "") {
            return;
        }*/
        const newToDos = {...toDos}
        newToDos[editKey].editing = false;
        setToDos(newToDos);
        await saveToDos(newToDos);
    }
    const editToDoText = async (payload) => {
        const newToDos = {...toDos}
        Object.keys(newToDos).map(key =>
        {
            if(newToDos[key].editing) {
                newToDos[key].text = payload;
            }
        }
        )
        setToDos(newToDos);
    }
    const editToDo = async (key, editing) => {
        const newToDos = {...toDos}
        if(newToDos[key].finished){
            return;
        }
        newToDos[key].editing = !editing;
        setToDos(newToDos);
        setEditKey(key);
    }

    const checkTodo = async (key, finished) => {
        const newToDos = {...toDos}
        newToDos[key].finished = finished;
        setToDos(newToDos);
        await saveToDos(newToDos);
    }

    const deleteToDo = async (key) => {
        if (Platform.OS === "web") {
            const ok = confirm("Do you want to delete this To Do?");
            if (ok) {
                const newToDos = {...toDos}
                delete newToDos[key];
                setToDos(newToDos);
                await saveToDos(newToDos);
            }
        } else {
            Alert.alert(
                'Delete To Do',
                'Are you Sure?',
                [
                    {text: 'Cancel', style: 'cancel'},
                    {
                        text: 'OK', onPress: async () => {
                            const newToDos = {...toDos}
                            delete newToDos[key];
                            setToDos(newToDos);
                            await saveToDos(newToDos);
                        }
                    }
                ]);
        }
    }
    return (
        <View style={styles.container}>
            <StatusBar style="auto"/>
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
                    value={text}
                    placeholder={working ? "Add a To Do" : "Where do you want to go?"}
                    style={styles.input}/>
            </View>
            <ScrollView>
                {
                    Object.keys(toDos).map(key =>
                        toDos[key].working === working ?
                            <View style={styles.toDo} key={key}>
                                { toDos[key].editing === false ?
                                    <View>
                                        <BouncyCheckbox
                                            size={25}
                                            //fillColor="red"
                                            unfillColor="#FFFFFF"
                                            isChecked={toDos[key].finished}
                                            text={toDos[key].text}
                                            onPress={() => checkTodo(key, !toDos[key].finished )}
                                        />
                                        {/*<Text style={styles.toDoText}>{toDos[key].text}</Text>*/}
                                    </View>
                                    :
                                    <View>
                                        <TextInput
                                            onSubmitEditing={submitToDoText}
                                            onChangeText={editToDoText}
                                            returnKeyType="done"
                                            value={toDos[key].text}
                                            placeholder={working ? "Add a To Do" : "Where do you want to go?"}
                                            style={styles.tinyInput}/>
                                    </View>
                                }
                                <View style={styles.toDoBtns}>
                                    <TouchableOpacity style={styles.toDoBtn} onPress={() => editToDo(key,toDos[key].editing)}>
                                        <Feather name="edit" size={18} color={theme.toDoBg} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.toDoBtn} onPress={() => deleteToDo(key)}>
                                        <Fontisto name="trash" size={18} color={theme.toDoBg}/>
                                    </TouchableOpacity>
                                </View>
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
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        marginTop: 100,
        justifyContent: "space-between",
    },
    btnText: {
        fontSize: 38,
        fontWeight: "600",
        color: "white",
    },
    input: {
        backgroundColor: "white",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginVertical: 20,
        fontSize: 18,
    },
    tinyInput:{
        backgroundColor: "white",
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 10,
       // marginVertical: 10,
        fontSize: 16,
    },
    toDo: {
        backgroundColor: theme.grey,
        marginBottom: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    toDoBtns: {
        backgroundColor: theme.grey,
        flexDirection: "row",
        alignItems: "center",
    },
    toDoBtn: {
        paddingHorizontal: 5,
    },
    toDoText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
});