import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

export default function Anotacao() {
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Pagina Anotacao</Text>
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