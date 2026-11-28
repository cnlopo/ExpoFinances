import { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import db from '../database/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PeriodoContext } from '../PeriodoContext';
import useAutoHideBars from '../hooks/useAutoHideBars';



export default function Registro() {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipo, setTipo] = useState('variavel');
    const [categoria, setCategoria] = useState('Outros');
    const [registros, setRegistros] = useState([]);
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [mostrarData, setMostrarData] = useState(false);
    const [cartoes, setCartoes] = useState([]);
    const [nomeCartao, setNomeCartao] = useState('');
    const [ultimosDigitos, setUltimosDigitos] = useState('');
    const [mostrarCadastroCartao, setMostrarCadastroCartao] = useState(false);
    const [modalCartoesVisivel, setModalCartoesVisivel] = useState(false);
    const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
    const {mesSelecionado, anoSelecionado} = useContext(PeriodoContext);
    const nomeMes = new Date(anoSelecionado, mesSelecionado).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'});
    const mesAnoFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    const controlarBarras = useAutoHideBars();

    function carregarRegistros() {

        const mesFormatado = String(mesSelecionado + 1).padStart(2, '0');
        const periodo = `${anoSelecionado}-${mesFormatado}`;

        const registros = db.getAllSync(
            `SELECT * FROM registros
            WHERE substr(data_registro, 1, 7) = ?
            ORDER BY data_registro DESC`,
            periodo
        );  

        setRegistros(registros);

    }

    function carregarCartoes() {
        const resultado = db.getAllSync(
            'SELECT * FROM cartoes ORDER BY nome'
        );

        setCartoes(resultado);
    }

    function salvarCartao() {
        if (!nomeCartao.trim()) {
            Alert.alert('Atenção', 'Informe o nome do cartão.');
            return;
        }

        if (ultimosDigitos.length !== 4) {
            Alert.alert('Atenção', 'Informe os 4 últimos dígitos.');
            return;
        }

        const id = Math.random().toString();

        db.runSync(
            `INSERT INTO cartoes (id, nome, ultimos_digitos)
            VALUES (?, ?, ?)`,
            [id, nomeCartao.trim(), ultimosDigitos]
        );

        setNomeCartao('');
        setUltimosDigitos('');
        setMostrarCadastroCartao(false);

        carregarCartoes();
    }

    function apagarCartao(id) {
        Alert.alert(
            'Excluir cartão',
            'Deseja realmente excluir este cartão?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: () => {
                        db.runSync(
                            'DELETE FROM cartoes WHERE id = ?',
                            [id]
                        );

                        carregarCartoes();
                    }
                }
            ]
        );
    }

    useEffect(() => {
        carregarRegistros();
        carregarCartoes();
    }, [mesSelecionado, anoSelecionado]);

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
            (id, descricao, valor, tipo, categoria, data_registro, cartao_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                novoRegistro.id,
                novoRegistro.descricao,
                novoRegistro.valor,
                novoRegistro.tipo,
                novoRegistro.categoria,
                `${dataSelecionada.getFullYear()}-${String(
                    dataSelecionada.getMonth() + 1
                ).padStart(2, '0')}-${String(
                    dataSelecionada.getDate()
                ).padStart(2, '0')}`,
                cartaoSelecionado,
            ]
        );

        const resultado = db.getAllSync(
            'SELECT * FROM registros'
        );

        console.log(resultado);

        carregarRegistros();

        setDescricao('');
        setValor('');
        setDataSelecionada(new Date());

        Alert.alert(
            'Sucesso!',
            'Registro salvo!'
        );
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

    const categorias = [
        { nome: 'Alimentação', icone: 'restaurant-outline' },
        { nome: 'Transporte', icone: 'car-outline' },
        { nome: 'Moradia', icone: 'home-outline' },
        { nome: 'Saúde', icone: 'medkit-outline' },
        { nome: 'Lazer', icone: 'game-controller-outline' },
        { nome: 'Outros', icone: 'apps-outline' },
    ];  

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            onScroll={controlarBarras}
            scrollEventThrottle={16}
        >

            <View style={styles.resumo}>
                <Text style={styles.tituloAlt}>Registros | {mesAnoFormatado}</Text>
                <Text style={styles.resumoTexto}>Receita:</Text>
                <Text style={styles.resumoRS}>R${receita.toFixed(2)}</Text>

                <Text style={styles.resumoTexto}>Gastos Fixos:</Text>
                <Text style={styles.resumoRS}>R${gastosFixos.toFixed(2)}</Text>

                <Text style={styles.resumoTexto}>Gastos Variáveis:</Text>
                <Text style={styles.resumoRS}>R${gastosVariaveis.toFixed(2)}</Text>

            </View>

            <TouchableOpacity
                style={styles.botaoCartoes}
                onPress={() => {
                    carregarCartoes();
                    setModalCartoesVisivel(true);
                }}
            >
                <Ionicons name="card-outline" size={20} color="black" />

                <Text style={styles.textoBotaoCartoes}>
                    Gerenciar Cartões
                </Text>

                <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>

            <View style={styles.tiposContainer}>
                <TouchableOpacity
                    style={[
                        styles.tipoBotao,
                        tipo === 'receita' &&
                        styles.tipoAtivo,
                    ]}
                    onPress={() => {
                        setTipo('receita');
                        setCartaoSelecionado(null);
                    }}
                >
                    <Text style={styles.tipoTexto}>
                       + Receita
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
                        Gasto Fixo
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
                        Gasto Variável
                    </Text>
                </TouchableOpacity>
            </View>

            {tipo !== 'receita' && (
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.subtitulo}>
                        Cartão (opcional)
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            gap: 8,
                            paddingBottom: 12,
                        }}
                    >
                        <TouchableOpacity
                                    style={[
                                styles.categoriaBotao,
                                cartaoSelecionado === null && styles.tipoAtivo,
                            ]}
                            onPress={() => setCartaoSelecionado(null)}
                        >
                            <Text style={styles.tipoTexto}>
                                Sem cartão
                            </Text>
                        </TouchableOpacity>

                        {cartoes.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.categoriaBotao,
                                    cartaoSelecionado === item.id && styles.tipoAtivo,
                                ]}
                                onPress={() => setCartaoSelecionado(item.id)}
                            >
                                <Text style={styles.tipoTexto}>
                                    {item.nome}
                                </Text>

                                <Text style={{ fontSize: 11, color: '#888' }}>
                                    Final {item.ultimos_digitos}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
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

            {tipo !== 'receita' && (
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.subtitulo}>
                        Categoria do gasto
                    </Text>

                    <View style={styles.categoriasContainer}>
                        {categorias.map((item) => (
                            <TouchableOpacity
                                key={item.nome}
                                style={[
                                    styles.categoriaSelecionavel,
                                    categoria === item.nome &&
                                    styles.categoriaSelecionada,
                                ]}
                                onPress={() => setCategoria(item.nome)}
                            >
                                <Ionicons
                                    name={item.icone}
                                    size={20}
                                    color={categoria === item.nome ? '#222' : '#777'}
                                />

                                <Text style={[
                                    styles.textoCategoria,
                                    categoria === item.nome &&
                                    styles.textoCategoriaSelecionada,
                                ]}>
                                    {item.nome}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Data que será recebido ou pago</Text>

                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setMostrarData(true)}
                >

                    <Ionicons
                        name="calendar-outline"
                        size={22}
                        color="#555"
                    />

                    <Text style={styles.dateText}>
                        {dataSelecionada.toLocaleDateString('pt-BR')}
                    </Text>

                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color="#888"
                    />

                </TouchableOpacity>
            </View>
            
            {mostrarData && (
                <DateTimePicker
                    value={dataSelecionada}
                    mode="date"
                    display="default"
                    onChange={(event, data) => {
                        setMostrarData(false);

                        if (data) {
                            setDataSelecionada(data);
                        }
                    }}
                />
            )}

            <TouchableOpacity
                style={styles.botao}
                onPress={salvarRegistro}
            >
                <Text style={styles.textoBotao}>
                    Salvar
                </Text>
            </TouchableOpacity>

            <View style={{
                height: 1,
                backgroundColor: '#b6b6b6',
                width: '100%',
            }} />

            <Text style={styles.subtitulo}>Receitas | {mesAnoFormatado}</Text>

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

            <View style={{
                height: 1,
                backgroundColor: '#b6b6b6',
                width: '60%',
                alignSelf: "center"
            }} />

            <Text style={styles.subtitulo}>Gastos Fixos | {mesAnoFormatado}</Text>

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

            <View style={{
                height: 1,
                backgroundColor: '#b6b6b6',
                width: '60%',
                alignSelf: "center"
            }} />

            <Text style={styles.subtitulo}>
                Gastos Variáveis | {mesAnoFormatado}
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

            <Modal
                visible={modalCartoesVisivel}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalCartoesVisivel(false)}
            >
                <View style={styles.modalFundo}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalCabecalho}>
                            <Text style={styles.modalTitulo}>
                                Meus cartões
                            </Text>

                            <TouchableOpacity
                                onPress={() => setModalCartoesVisivel(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={26}
                                    color="black"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.botaoAdicionarCartao}
                            onPress={() =>
                                setMostrarCadastroCartao(!mostrarCadastroCartao)
                            }
                        >
                            <Ionicons name="add-circle-outline" size={20} color="black" />

                            <Text style={styles.textoBotaoCartoes}>
                                Adicionar cartão
                            </Text>
                        </TouchableOpacity>

                        {mostrarCadastroCartao && (
                            <View style={styles.formularioCartao}>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome do cartão (Ex: Nubank)"
                                    value={nomeCartao}
                                    onChangeText={setNomeCartao}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Últimos 4 dígitos"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={ultimosDigitos}
                                    onChangeText={(texto) =>
                                        setUltimosDigitos(
                                            texto.replace(/\D/g, '').slice(0, 4)
                                        )
                                    }
                                />

                                <TouchableOpacity
                                    style={styles.botao}
                                    onPress={salvarCartao}
                                >
                                    <Text style={styles.textoBotao}>
                                        Salvar cartão
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}

                        <Text style={styles.subtitulo}>
                            Cartões cadastrados
                        </Text>

                        {cartoes.length === 0 ? (
                            <Text style={styles.vazio}>
                                Nenhum cartão cadastrado.
                            </Text>
                        ) : (
                            <FlatList
                                data={cartoes}
                                keyExtractor={(item) => item.id}
                                style={{ maxHeight: 300 }}
                                renderItem={({ item }) => (
                                    <View style={styles.cartaoItem}>

                                        <View style={styles.cartaoInformacoes}>
                                            <Ionicons
                                                name="card-outline"
                                                size={24}
                                                color="black"
                                            />

                                            <View>
                                                <Text style={styles.cartaoNome}>
                                                    {item.nome}
                                                </Text>

                                                <Text style={styles.cartaoDigitos}>
                                                    Final {item.ultimos_digitos}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => apagarCartao(item.id)}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={21}
                                                color="red"
                                            />
                                        </TouchableOpacity>

                                    </View>
                                )}
                            />
                        )}

                    </View>
                </View>
            </Modal>

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

    dateContainer: {
        marginBottom: 20,
    },

    dateLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#5b5a5a',
        marginBottom: 10,
        paddingTop: 15,
        textAlign: "center",
    },

    dateHint: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },

    dateInput: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dateText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#333',
    },

    titulo: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    tituloAlt: {
        fontFamily: 'Inter_600SemiBold',
        color: '#999',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: "center",
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
        fontSize: 13,
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
        backgroundColor: 'rgb(217, 217, 217)',
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
        color: '#656464',
        fontSize: 15,
        marginBottom: 10,
        marginTop: 20,
        textAlign: "center",
    },

    vazio: {
        fontFamily: 'Inter_400Regular',
        color: 'black',
        marginBottom: 10,
        textAlign: "center",
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

    botaoCartoes: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },

    textoBotaoCartoes: {
        fontFamily: 'Inter_400Regular',
        color: 'black',
        fontSize: 15,
        flex: 1,
        marginLeft: 10,
    },

    modalFundo: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 20,
    },

    modalCabecalho: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    modalTitulo: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 22,
        color: 'black',
    },

    botaoAdicionarCartao: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 15,
    },

    formularioCartao: {
        marginBottom: 10,
    },

    cartaoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },

    cartaoInformacoes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    cartaoNome: {
        fontSize: 15,
        fontWeight: '600',
        color: 'black',
    },

    cartaoDigitos: {
        fontSize: 13,
        color: '#888',
        marginTop: 3,
    },

    categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    },

    categoriaSelecionavel: {
        width: '31%',
        minHeight: 75,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        marginBottom: 8,
        gap: 5,
    },

    categoriaSelecionada: {
        backgroundColor: '#F2F2F2',
        borderColor: '#999',
    },

    textoCategoria: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#777',
        textAlign: 'center',
    },

    textoCategoriaSelecionada: {
        color: 'black',
        fontFamily: 'Inter_600SemiBold',
    },
});