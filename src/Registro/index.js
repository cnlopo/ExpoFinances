import { useState, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import db from '../database/database';

export default function Registro() {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState('variavel');
    const [categoria, setCategoria] = useState('Outros');

    const [registros, setRegistros] = useState([]);

    function carregarRegistros() {

        const resultado = db.getAllSync(
            'SELECT * FROM registros'
        );

        setRegistros(resultado);
    }

    useEffect(() => {

        carregarRegistros();

    }, []);

    function formatarMoeda(valor) {
        const numero = valor.replace(/\D/g, '');

        const valorFormatado = (
            Number(numero) / 100
        ).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return valorFormatado;
    }

    function salvarRegistro() {

        if (!descricao || !valor) return;

        const novoRegistro = {

            id: Math.random().toString(),

            descricao: descricao,

            valor: Number(
                valor
                    .replace('R$', '')
                    .replace(/\./g, '')
                    .replace(',', '.')
            ),

            tipo,
            categoria,
        };

        db.runSync(
            `INSERT INTO registros
(id, descricao, valor, tipo, categoria)
VALUES (?, ?, ?, ?, ?)`,
            [
                novoRegistro.id,
                novoRegistro.descricao,
                novoRegistro.valor,
                novoRegistro.tipo,
                novoRegistro.categoria,
            ]
        );

        const resultado = db.getAllSync(
            'SELECT * FROM registros'
        );

        console.log(resultado);

        carregarRegistros();

        setDescricao('');
        setValor('');
    }

    function apagarRegistro(id) {

        if (Platform.OS === 'web') {

            const confirmar = window.confirm(
                'Deseja realmente apagar?'
            );

            if (confirmar) {

                db.runSync(
                    'DELETE FROM registros WHERE id = ?',
                    [id]
                );

                carregarRegistros();
            }

        } else {

            Alert.alert(
                'Excluir registro',
                'Deseja realmente apagar?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },

                    {
                        text: 'Apagar',
                        style: 'destructive',

                        onPress: () => {

                            db.runSync(
                                'DELETE FROM registros WHERE id = ?',
                                [id]
                            );

                            carregarRegistros();
                        },
                    },
                ]
            );
        }
    }

    const receita = registros
        .filter((item) => item.tipo === 'receita')
        .reduce((total, item) => total + item.valor, 0);

    const gastosFixosLista = registros.filter(
        (item) => item.tipo === 'fixo'
    );

    const gastosVariaveisLista = registros.filter(
        (item) => item.tipo === 'variavel'
    );

    const receitasLista = registros.filter(
        (item) => item.tipo === 'receita'
    );

    const gastosFixos = gastosFixosLista.reduce(
        (total, item) => total + item.valor,
        0
    );

    const gastosVariaveis =
        gastosVariaveisLista.reduce(
            (total, item) => total + item.valor,
            0
        );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.titulo}>Resumo</Text>

            <View style={styles.resumo}>
                <Text style={styles.resumoTexto}>Receita:</Text>
                <Text style={styles.resumoRS}>R${receita.toFixed(2)}</Text>

                <Text style={styles.resumoTexto}>Gastos Fixos:</Text>
                <Text style={styles.resumoRS}>R${gastosFixos.toFixed(2)}</Text>

                <Text style={styles.resumoTexto}>Gastos Variáveis:</Text>
                <Text style={styles.resumoRS}>R${gastosVariaveis.toFixed(2)}</Text>

            </View>

            <View style={styles.tiposContainer}>
                <TouchableOpacity
                    style={[
                        styles.tipoBotao,
                        tipo === 'receita' &&
                        styles.tipoAtivo,
                    ]}
                    onPress={() => setTipo('receita')}
                >
                    <Text style={styles.tipoTexto}>
                        Receita
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tipoBotao,
                        tipo === 'fixo' &&
                        styles.tipoAtivo,
                    ]}
                    onPress={() => setTipo('fixo')}
                >
                    <Text style={styles.tipoTexto}>
                        Fixo
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tipoBotao,
                        tipo === 'variavel' &&
                        styles.tipoAtivo,
                    ]}
                    onPress={() => setTipo('variavel')}
                >
                    <Text style={styles.tipoTexto}>
                        Variável
                    </Text>
                </TouchableOpacity>
            </View>

            {tipo !== 'receita' && (
                <>
                    <Text style={styles.subtitulo}>
                        Categoria
                    </Text>

                    <ScrollView
                        horizontal
                        nestedScrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            gap: 8,
                            paddingHorizontal: 2,
                            paddingBottom: 12,
                        }}
                    >
                        {[
                            'Alimentação',
                            'Transporte',
                            'Moradia',
                            'Saúde',
                            'Lazer',
                            'Outros'
                        ].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.categoriaBotao,
                                    categoria === item &&
                                    styles.tipoAtivo,
                                ]}
                                onPress={() => setCategoria(item)}
                            >
                                <Text style={styles.tipoTexto}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}

            <TextInput
                placeholder={
                    tipo === 'receita'
                        ? 'Ex: Salário, Extra, Freela...'
                        : 'Descrição'
                }
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
            />

            <TextInput
                placeholder="Valor"
                style={styles.input}
                keyboardType="numeric"
                value={valor}
                onChangeText={(texto) =>
                    setValor(formatarMoeda(texto))
                }
            />

            <TouchableOpacity
                style={styles.botao}
                onPress={salvarRegistro}
            >
                <Text style={styles.textoBotao}>
                    Salvar
                </Text>
            </TouchableOpacity>

            <Text style={styles.subtitulo}>
                Receitas
            </Text>

            {receitasLista.length === 0 && (
                <Text style={styles.vazio}>
                    Nenhuma receita
                </Text>
            )}

            <FlatList
                scrollEnabled={false}
                data={receitasLista}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.linhaCard}>
                            <Text style={styles.cardTexto}>
                                R$ {item.valor.toFixed(2)} -{' '}
                                {item.descricao}
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    apagarRegistro(item.id)
                                }
                            >
                                <Ionicons
                                    name="trash"
                                    size={20}
                                    color="red"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Text style={styles.subtitulo}>Gastos Fixos</Text>

            {gastosFixosLista.length === 0 && (
                <Text style={styles.vazio}>Nenhum gasto fixo</Text>
            )}

            <FlatList
                scrollEnabled={false}
                data={gastosFixosLista}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.linhaCard}>
                            <Text style={styles.cardTexto}>
                                R$ {item.valor.toFixed(2)} -{' '}
                                {item.descricao}
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    apagarRegistro(item.id)
                                }
                            >
                                <Ionicons
                                    name="trash"
                                    size={20}
                                    color="red"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Text style={styles.subtitulo}>
                Gastos Variáveis
            </Text>

            {gastosVariaveisLista.length === 0 && (
                <Text style={styles.vazio}>
                    Nenhum gasto variável
                </Text>
            )}

            <FlatList
                scrollEnabled={false}
                data={gastosVariaveisLista}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.linhaCard}>
                            <Text style={styles.cardTexto}>
                                R$ {item.valor.toFixed(2)} -{' '}
                                {item.descricao}
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    apagarRegistro(item.id)
                                }
                            >
                                <Ionicons
                                    name="trash"
                                    size={20}
                                    color="red"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Text></Text>
            <Text></Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 20,
    },

    titulo: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    resumo: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },

    resumoTexto: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 5,
        fontSize: 16,
    },

    resumoRS: {
        fontFamily: 'Inter_500Medium',
        color: 'black',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 5,
        fontSize: 28,
    },

    tiposContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    tipoBotao: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 12,
        borderRadius: 10,
        width: '31%',
        alignItems: 'center',
    },

    categoriaBotao: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
    },

    tipoAtivo: {
        backgroundColor: '#F2F2F2',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },

    tipoTexto: {
        fontFamily: 'Inter_400Regular',
        color: 'black',
        fontSize: 14,
    },

    input: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },

    botao: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 25,
    },

    textoBotao: {
        fontFamily: 'Inter_400Regular',
        color: 'black',
    },

    subtitulo: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 22,
        marginBottom: 10,
        marginTop: 10,
    },

    vazio: {
        fontFamily: 'Inter_400Regular',
        color: 'black',
        marginBottom: 10,
    },

    card: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 18,
        borderRadius: 12,
        marginBottom: 10,
    },

    linhaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    cardTexto: {
        color: 'black',
        fontSize: 16,
        fontWeight: '500',
    },
});