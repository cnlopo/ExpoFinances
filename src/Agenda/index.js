import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

export default function Agenda() {
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Pagina Agenda</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    text:{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 25,
    }
});