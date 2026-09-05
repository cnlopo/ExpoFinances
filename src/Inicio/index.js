import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Entypo, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/database';


export default function Inicio() {

    const dataAtual = new Date();

    const mesAtual = dataAtual.toLocaleDateString(
        'pt-BR',
        {
            month: 'long',
            year: 'numeric',
        }
    );

    const [receitas, setReceitas] = useState(0);
    const [gastosFixos, setGastosFixos] = useState(0);
    const [gastosVariaveis, setGastosVariaveis] = useState(0);
    const [saldo, setSaldo] = useState(0);
    function carregarDados() {
        const registros = db.getAllSync(
            'SELECT * FROM registros'
        );

        const totalReceitas = registros
            .filter(item => item.tipo === 'receita')
            .reduce((total, item) => total + item.valor, 0);

        const totalFixos = registros
            .filter(item => item.tipo === 'fixo')
            .reduce((total, item) => total + item.valor, 0);

        const totalVariaveis = registros
            .filter(item => item.tipo === 'variavel')
            .reduce((total, item) => total + item.valor, 0);

        setReceitas(totalReceitas);
        setGastosFixos(totalFixos);
        setGastosVariaveis(totalVariaveis);
        setSaldo(
            totalReceitas -
            totalFixos -
            totalVariaveis
        );
    }

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    const percentualDespesas =
        receitas > 0
            ? (((gastosFixos + gastosVariaveis) / receitas) * 100).toFixed(0)
            : 0;

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardBotoes}
            >
                {[
                    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                ].map((mes, index) => (
                    <TouchableOpacity
                        key={mes}
                        style={
                            index === new Date().getMonth()
                                ? styles.botoesAtivo
                                : styles.botoes
                        }
                    >
                        <Text
                            style={
                                index === new Date().getMonth()
                                    ? styles.botoesTextoAtivo
                                    : styles.botoesTexto
                            }
                        >
                            {mes}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.card}>
                <Text style={styles.texto}>Receitas:</Text>
                <Text style={styles.titulo}>
                    R$ {receitas.toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    Total recebido no mês
                </Text>

                <Text></Text>

                <Text style={styles.texto}>Despesa Mensal:</Text>
                <Text style={styles.titulo}>
                    R$ {(gastosFixos + gastosVariaveis).toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    {percentualDespesas}% da renda total
                </Text>

                <Text></Text>

                <Text
                    style={[
                        styles.titulo,
                        {
                            color: saldo < 0 ? '#D32F2F' : '#0F8C33',
                        },
                    ]}
                >
                    R$ {saldo.toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    Valor disponível
                </Text>
            </View>
            <View style={styles.card}>
                <View style={styles.emoji}>
                    <Feather name="clock" size={20} /><Text style={styles.texto}>Contas a pagar:</Text>
                </View>
                <Text style={styles.legenda}>• Em desenvolvimento</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.emoji}>
                    <Entypo name="credit-card" size={20} /><Text style={styles.texto}>Fatura Cartão de Crédito:</Text>
                </View>
                <Text style={styles.legenda}>• Em desenvolvimento</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.emoji}>
                    <Octicons name="goal" size={20} /><Text style={styles.texto}>Minhas metas:</Text>
                </View>
                <Text style={styles.legenda}>• Em desenvolvimento</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.emoji}>
                    <MaterialIcons name="equalizer" size={20} /><Text style={styles.texto}>Meus limites:</Text>
                </View>
                <Text style={styles.legenda}>• Em desenvolvimento</Text>
            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    cardBotoes: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    botoes: {
        width: 60,
        backgroundColor: '#F6F6F6',
        padding: 10,
        borderRadius: 20,
    },

    botoesTexto: {
        textAlign: 'center',
        fontFamily: 'Inter_500Medium',
        color: 'black',
        fontSize: 16,
    },

    botoesAtivo: {
        width: 70,
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 20,
    },

    botoesTextoAtivo: {
        textAlign: 'center',
        fontFamily: 'Inter_500Medium',
        color: 'white',
        fontSize: 16,

    },

    card: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 20,
        borderRadius: 15,
        marginBottom: 12,
        marginLeft: 16,
        marginRight: 16,
    },

    emoji: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    tituloApp: {
        fontFamily: 'Inter_700Bold',
        color: 'black',
        fontSize: 24,
    },

    titulo: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 28,
    },

    texto: {
        fontFamily: 'Inter_500Medium',
        color: 'black',
        fontSize: 16,
    },

    legenda: {
        fontFamily: 'Inter_400Regular',
        color: '#828282',
        fontSize: 12,
    },
});