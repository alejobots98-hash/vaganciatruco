require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const discordTranscripts = require("discord-html-transcripts");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ===================== CONFIGURACIÓN =====================
const PREFIX = "!truco"; 
const CANAL_FILA_ID = "1491738368927596574"; 
const CREAR_FILA_ROLE_ID = "1486959938038136912";
const STAFF_ROLE_ID = "1476541425263968391";
const EXTRA_MOD_ROLE_ID = "1211760228673257524"; // Nuevo rol permitido para cerrar
const LOG_CHANNEL_ID = "1486176116413825206";

// Imagen Thumbnail
const URL_THUMBNAIL_PERSONALIZADO = "https://i.imgur.com/b7XMeUs.png";

const estadosFilas = new Map();

// ===================== EMOJIS =====================
const EMOJI_CARTAS_MESA = "<:white_cartas_worclay:1491745807794438195>";
const EMOJI_DINERO_ANIMADO = "<a:money_sign:1491745833190690847>";
const EMOJI_CARTAS = "🃏";
const EMOJI_FUEGO = "🔥";
const EMOJI_MATE = "🧉";

// ===================== EMBED REGLAS Y PAGOS =====================
function embedPagos() {
  return new EmbedBuilder()
    .setColor(0x006400)
    .setTitle(`${EMOJI_CARTAS} REGLAS DEL TRUCO & PAGOS`)
    .setDescription(
`━━━━━━━━━━━━━━━━━━
**💰 MÉTODOS DE COBRO**

🏦 **Banco Ripio**
┗ 👤 Alejo German Tolosa  
┗ 🔗 Alias: \`vg.ripio\`

🌐 **AstroPay**
┗ 🔗 https://onetouch.astropay.com/payment?external_reference_id=8lIV0oqyplqnZulPqVirFZbTf2rkhLsR

💎 **Binance**
┗ 🆔 ID: \`729592524\`

━━━━━━━━━━━━━━━━━━
**📝 REGLAMENTO DE APUESTAS**

🌐 **Única página válida para jugar:**
┗ https://trucogame.com/game

📸 **Validación de victoria:**
┗ El ganador debe enviar captura de la victoria obligatoriamente.

💰 **Comisión:**
┗ $400 ARS en apuestas de $3.000 en adelante.

━━━━━━━━━━━━━━━━━━
**VAGANCIA SYSTEM**
⚔️ Sistema automático de apuestas
🛡️ **VAGANCIA • Sistema oficial**`
    )
    .setFooter({ 
      text: "TRUCO GAMING • ¡Quiero vale cuatro!",
      iconURL: URL_THUMBNAIL_PERSONALIZADO 
    });
}

// ===================== EMBED FILA =====================
function crearEmbedFila(data = { f1: null, f2: null, f3: null }) {
  const p1 = data.f1 ? `<@${data.f1}>` : "*Esperando retador...*";
  const p2 = data.f2 ? `<@${data.f2}>` : "*Esperando retador...*";
  const p3 = data.f3 ? `<@${data.f3}>` : "*Esperando retador...*";

  return new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle(`${EMOJI_MATE} | ¿QUIÉN SE PRENDE A UN TRUCO?`)
    .setDescription(
`**Modalidad:** Apostado ${EMOJI_DINERO_ANIMADO}
**Puntos:** A 15 o 30 tantos

**Mesas disponibles:**
${EMOJI_CARTAS_MESA} **Mesa 1:** ${p1}
${EMOJI_CARTAS_MESA} **Mesa 2:** ${p2}
${EMOJI_CARTAS_MESA} **Mesa 3:** ${p3}

*Hacé clic en el botón para sentarte en la mesa.*`
    )
    .setThumbnail(URL_THUMBNAIL_PERSONALIZADO)
    .setFooter({ text: "TRUCO GAMING • El sistema de los timberos" });
}

// ===================== BOTONES =====================
function botonesTripleFila() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("btn_f1").setLabel("Mesa 1").setEmoji("🎴").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("btn_f2").setLabel("Mesa 2").setEmoji("🎴").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("btn_f3").setLabel("Mesa 3").setEmoji("🎴").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("salir_fila").setLabel("Levantarse").setEmoji("🚫").setStyle(ButtonStyle.Danger)
  );
}

// ===================== EVENTO MENSAJE =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot || message.content !== PREFIX) return;
  if (message.channel.id !== CANAL_FILA_ID) return;

  const esAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
  const tieneRol = message.member.roles.cache.has(CREAR_FILA_ROLE_ID);

  if (!esAdmin && !tieneRol) return message.reply("❌ No tienes permiso.");

  const msg = await message.channel.send({
    embeds: [crearEmbedFila()],
    components: [botonesTripleFila()],
  });

  estadosFilas.set(msg.id, { f1: null, f2: null, f3: null });
});

// ===================== EVENTO INTERACCIÓN =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // CERRAR MESA
  if (interaction.customId === "cerrar_partida") {
    const tienePermiso = interaction.member.roles.cache.has(STAFF_ROLE_ID) || 
                         interaction.member.roles.cache.has(EXTRA_MOD_ROLE_ID) ||
                         interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!tienePermiso) {
      return interaction.reply({ content: "❌ No tienes permiso para cerrar la mesa.", ephemeral: true });
    }
    
    const canalDestino = interaction.channel;
    await interaction.reply({ content: "⏳ Cerrando mesa y guardando registro...", ephemeral: true });
    
    try {
      const attachment = await discordTranscripts.createTranscript(canalDestino, {
        limit: -1,
        fileName: `mesa-${canalDestino.name}.html`,
        saveImages: true,
        poweredBy: false,
      });

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({
          content: `📝 **Mesa Finalizada**\nSala: \`${canalDestino.name}\`\nCerrada por: <@${interaction.user.id}>`,
          files: [attachment],
        });
      }
    } catch (e) { console.error(e); }

    setTimeout(async () => {
      try { if (canalDestino.deletable) await canalDestino.delete(); } catch (err) {}
    }, 2000);
    return;
  }

  const data = estadosFilas.get(interaction.message.id);
  if (!data) return interaction.reply({ content: "❌ Mesa no encontrada.", ephemeral: true });

  const userId = interaction.user.id;

  if (interaction.customId === "salir_fila") {
    if (data.f1 === userId) data.f1 = null;
    if (data.f2 === userId) data.f2 = null;
    if (data.f3 === userId) data.f3 = null;
    return await interaction.update({ embeds: [crearEmbedFila(data)] });
  }

  const mapping = { "btn_f1": "f1", "btn_f2": "f2", "btn_f3": "f3" };
  const filaKey = mapping[interaction.customId];
  if (!filaKey) return;

  if (data.f1 === userId || data.f2 === userId || data.f3 === userId) {
    if (data[filaKey] !== userId) {
      return interaction.reply({ content: "⚠️ Ya estás sentado en una mesa.", ephemeral: true });
    }
  }

  if (!data[filaKey]) {
    data[filaKey] = userId;
    await interaction.update({ embeds: [crearEmbedFila(data)] });
  } else {
    if (data[filaKey] === userId) {
      return interaction.reply({ content: "⚠️ Ya estás aquí.", ephemeral: true });
    }
    
    const rivalId = data[filaKey];
    data[filaKey] = null;
    await interaction.update({ embeds: [crearEmbedFila(data)] });
    await crearCanalPrivado(interaction, [rivalId, userId]);
  }
});

// ===================== CANAL PRIVADO =====================
async function crearCanalPrivado(interaction, jugadores) {
  const guild = interaction.guild;
  const parent = interaction.channel.parent;

  const nombres = jugadores
    .map((id) => guild.members.cache.get(id)?.user.username || "jugador")
    .join("-vs-")
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 80);

  const canal = await guild.channels.create({
    name: `🃏┃${nombres}`,
    type: ChannelType.GuildText,
    parent,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: EXTRA_MOD_ROLE_ID, // El nuevo rol también ve el canal privado
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      ...jugadores.map(id => ({
        id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      })),
    ],
  });

  const embedMatch = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle(`${EMOJI_FUEGO} ¡DUELO DE TRUCO INICIADO!`)
    .setDescription(
`🎴 **LOS DESAFIANTES**

<@${jugadores[0]}> **v.s** <@${jugadores[1]}>

━━━━━━━━━━━━━━━━━━
🔹 ¡Buena suerte a ambos!
━━━━━━━━━━━━━━━━━━`
    );

  await canal.send({
    content: `${jugadores.map(id => `<@${id}>`).join(" ")} | <@&${STAFF_ROLE_ID}> <@&${EXTRA_MOD_ROLE_ID}>`,
    embeds: [embedMatch],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("cerrar_partida")
          .setLabel("LEVANTAR MESA")
          .setEmoji("🤝")
          .setStyle(ButtonStyle.Danger)
      )
    ]
  });

  await canal.send({ embeds: [embedPagos()] });
}

client.once("ready", () => {
  console.log(`🃏 Bot conectado: ${client.user.tag}`);
});

client.login(process.env.TOKEN);