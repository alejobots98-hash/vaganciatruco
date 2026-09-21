
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
const CLOSE_COMMAND = "!close";

const CANAL_FILA_ID = "1491738368927596574";
const CANAL_INTERMEDIARIOS_ID = "1506448806697238682";

const CREAR_FILA_ROLE_ID = "1486959938038136912";
const STAFF_ROLE_ID = "1476541425263968391";
const EXTRA_MOD_ROLE_ID = "1211760228673257524";

const LOG_CHANNEL_ID = "1486176116413825206";

const URL_THUMBNAIL_PERSONALIZADO =
  "https://i.imgur.com/b7XMeUs.png";

const estadosFilas = new Map();
const filasIntermediarios = new Map();

// ===================== EMOJIS =====================

const EMOJI_CARTAS_MESA =
  "<:white_cartas_worclay:1491745807794438195>";

const EMOJI_DINERO_ANIMADO =
  "<a:money_sign:1491745833190690847>";

const EMOJI_CARTAS = "🃏";
const EMOJI_FUEGO = "🔥";
const EMOJI_MATE = "🧉";

// ===================== INTERMEDIARIOS =====================

const METODOS_INTERMEDIARIOS = {
  "1548764206592032871": {
    banco: "mercado pago",
    nombre: "lautaro jose nehuen figueroa",
    alias: "vg.lauty7",
    link: "https://onetouch.astropay.com/payment?external_reference_id=n0iFPqlqR711ohBNW4hEEGbzRkxsTbwo",
  },

  "1049772413161836585": {
    banco: "AstroPay",
    nombre: "Candela Yazmin Bustamante",
    alias: "cxn.apos",
  },

  "1270282979037679659": {
    banco: "Naranja X",
    nombre: "Hernan Guevara",
    alias: "7hernann",
  },

  "1293263654250217549": {
    banco: "Uala",
    nombre: "Lucca demian Nuñez",
    alias: "vg.luk7",
  },

  "636714624552534016": {
    banco: "Uala",
    nombre: "Anabela Magali Martin",
    alias: "mailen.uala26",
  },

  "779427469009879040": {
    banco: "Astropay",
    nombre: "Angela Malena Canete",
    alias: "vgkuchito",
  },

  "1291407413584592896": {
    banco: "Uala",
    nombre: "Antonella Sheila Porpora",
    alias: "vg.pepou",
  },
};

// ===================== PERMISOS =====================

function tienePermisoStaff(member) {
  return (
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    ) ||
    member.roles.cache.has(STAFF_ROLE_ID) ||
    member.roles.cache.has(EXTRA_MOD_ROLE_ID)
  );
}

function puedeCrearFila(member) {
  return (
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    ) ||
    member.roles.cache.has(CREAR_FILA_ROLE_ID)
  );
}

// ===================== EMBED PAGOS =====================

function embedPagos() {
  return new EmbedBuilder()
    .setColor(0x006400)
    .setTitle(`${EMOJI_CARTAS} REGLAS DEL TRUCO & PAGOS`)
    .setDescription(
      `━━━━━━━━━━━━━━━━━━

**💰 MÉTODOS DE COBRO**

🏦 **Personal Pay**
┗ 👤 Alejo German Tolosa
┗ 🔗 Alias: \`vg.cuentas\`

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
      iconURL: URL_THUMBNAIL_PERSONALIZADO,
    });
}

// ===================== EMBED FILA =====================

function crearEmbedFila(data = { f1: null, f2: null, f3: null }) {
  const p1 = data.f1
    ? `<@${data.f1}>`
    : "*Esperando retador...*";

  const p2 = data.f2
    ? `<@${data.f2}>`
    : "*Esperando retador...*";

  const p3 = data.f3
    ? `<@${data.f3}>`
    : "*Esperando retador...*";

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
    .setFooter({
      text: "TRUCO GAMING • El sistema de los timberos",
    });
}

// ===================== BOTONES FILA =====================

function botonesTripleFila() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_f1")
      .setLabel("Mesa 1")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("btn_f2")
      .setLabel("Mesa 2")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("btn_f3")
      .setLabel("Mesa 3")
      .setEmoji("🎴")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("salir_fila")
      .setLabel("Levantarse")
      .setEmoji("🚫")
      .setStyle(ButtonStyle.Danger)
  );
}

// ===================== AVISO INTERMEDIARIO =====================

function crearAvisoIntermediario(jugadores) {
  return new EmbedBuilder()
    .setColor(0x00AE86)
    .setTitle("🃏 NUEVA FILA DE TRUCO")
    .setDescription(
      `🔥 **¡HAY UNA PARTIDA DISPONIBLE!**

👤 **Jugadores:**

<@${jugadores[0]}>
<@${jugadores[1]}>

💰 **Modalidad:** Truco apostado

🤝 Un intermediario puede tomar esta fila.

⚠️ El primer intermediario que tome la fila será asignado a la partida.`
    )
    .setFooter({
      text: "VAGANCIA SYSTEM • INTERMEDIARIOS",
    });
}

// ===================== AVISAR INTERMEDIARIOS =====================

async function avisarIntermediarios(
  interaction,
  jugadores,
  canal
) {
  const canalIntermediarios =
    interaction.guild.channels.cache.get(
      CANAL_INTERMEDIARIOS_ID
    );

  if (!canalIntermediarios) {
    console.log("❌ Canal de intermediarios no encontrado.");
    return;
  }

  const mensaje = await canalIntermediarios.send({
    embeds: [crearAvisoIntermediario(jugadores)],

    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tomar_fila_${canal.id}`)
          .setLabel("TOMAR FILA")
          .setEmoji("🤝")
          .setStyle(ButtonStyle.Success)
      ),
    ],
  });

  filasIntermediarios.set(canal.id, {
    jugadores,
    canalId: canal.id,
    mensajeId: mensaje.id,
    intermediarioId: null,
  });
}

// ===================== DATOS DEL INTERMEDIARIO =====================

function crearDatosPago(intermediario) {
  return `🏦 **Método:** ${intermediario.banco}
👤 **Titular:** ${intermediario.nombre}
🔗 **Alias:** \`${intermediario.alias}\`
${
  intermediario.link
    ? `🌐 **Link:** ${intermediario.link}`
    : ""
}`;
}

// ===================== COMANDO CREAR FILA =====================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content !== PREFIX) return;

  if (message.channel.id !== CANAL_FILA_ID) return;

  if (!puedeCrearFila(message.member)) {
    return message.reply("❌ No tienes permiso.");
  }

  const msg = await message.channel.send({
    embeds: [crearEmbedFila()],
    components: [botonesTripleFila()],
  });

  estadosFilas.set(msg.id, {
    f1: null,
    f2: null,
    f3: null,
  });
});

// ===================== COMANDO CLOSE =====================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content !== CLOSE_COMMAND) return;

  if (message.channel.id !== CANAL_FILA_ID) return;

  if (!puedeCrearFila(message.member)) {
    return message.reply("❌ No tienes permiso para cerrar las filas.");
  }

  let cerradas = 0;

  const mensajesFila = [...estadosFilas.keys()];

  for (const mensajeId of mensajesFila) {
    try {
      const mensaje = await message.channel.messages.fetch(mensajeId);

      if (mensaje) {
        await mensaje.delete().catch(() => {});
      }

      estadosFilas.delete(mensajeId);
      cerradas++;
    } catch (error) {
      estadosFilas.delete(mensajeId);
    }
  }

  return message.reply({
    content: `✅ Se cerraron **${cerradas}** fila(s) activas.`,
  });
});

// ===================== INTERACCIONES =====================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ===================== TOMAR FILA =====================

  if (interaction.customId.startsWith("tomar_fila_")) {
    const canalId = interaction.customId.replace(
      "tomar_fila_",
      ""
    );

    const fila = filasIntermediarios.get(canalId);

    if (!fila) {
      return interaction.reply({
        content: "❌ Esta fila ya no está disponible.",
        ephemeral: true,
      });
    }

    const intermediario =
      METODOS_INTERMEDIARIOS[interaction.user.id];

    if (!intermediario) {
      return interaction.reply({
        content: "❌ No estás autorizado como intermediario.",
        ephemeral: true,
      });
    }

    if (fila.intermediarioId) {
      return interaction.reply({
        content: "⚠️ Esta fila ya fue tomada por otro intermediario.",
        ephemeral: true,
      });
    }

    fila.intermediarioId = interaction.user.id;

    const canalPartida =
      interaction.guild.channels.cache.get(canalId);

    if (!canalPartida) {
      filasIntermediarios.delete(canalId);

      return interaction.reply({
        content: "❌ El canal de la partida no existe.",
        ephemeral: true,
      });
    }

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0x808080)
          .setTitle("🤝 FILA TOMADA")
          .setDescription(
            `✅ **Intermediario asignado:** <@${interaction.user.id}>

🃏 La partida ya tiene un intermediario.`
          ),
      ],
      components: [],
    });

    const datosPago = crearDatosPago(intermediario);

    await canalPartida.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle("🤝 INTERMEDIARIO ASIGNADO")
          .setDescription(
            `🎴 **El intermediario de esta partida es:**

<@${interaction.user.id}>

━━━━━━━━━━━━━━━━━━

💰 **DATOS DE PAGO**

${datosPago}

━━━━━━━━━━━━━━━━━━

✅ Ya pueden coordinar la partida con el intermediario.`
          ),
      ],
    });

    return;
  }

  // ===================== CERRAR MESA =====================

  if (interaction.customId === "cerrar_partida") {
    const tienePermiso = tienePermisoStaff(interaction.member);

    if (!tienePermiso) {
      return interaction.reply({
        content: "❌ No tienes permiso para cerrar la mesa.",
        ephemeral: true,
      });
    }

    const canalDestino = interaction.channel;

    await interaction.reply({
      content: "⏳ Cerrando mesa y guardando registro...",
      ephemeral: true,
    });

    try {
      const attachment =
        await discordTranscripts.createTranscript(canalDestino, {
          limit: -1,
          fileName: `mesa-${canalDestino.name}.html`,
          saveImages: true,
          poweredBy: false,
        });

      const logChannel =
        interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

      if (logChannel) {
        await logChannel.send({
          content: `📝 **Mesa Finalizada**
Sala: \`${canalDestino.name}\`
Cerrada por: <@${interaction.user.id}>`,

          files: [attachment],
        });
      }
    } catch (e) {
      console.error("Error al guardar transcripción:", e);
    }

    // Limpiar fila de intermediarios
    filasIntermediarios.delete(canalDestino.id);

    setTimeout(async () => {
      try {
        if (canalDestino.deletable) {
          await canalDestino.delete();
        }
      } catch (err) {
        console.error("Error al eliminar canal:", err);
      }
    }, 2000);

    return;
  }

  // ===================== BOTONES DE FILA =====================

  const data = estadosFilas.get(interaction.message.id);

  if (!data) {
    return interaction.reply({
      content: "❌ Mesa no encontrada.",
      ephemeral: true,
    });
  }

  const userId = interaction.user.id;

  // ===================== SALIR DE FILA =====================

  if (interaction.customId === "salir_fila") {
    if (data.f1 === userId) data.f1 = null;
    if (data.f2 === userId) data.f2 = null;
    if (data.f3 === userId) data.f3 = null;

    return await interaction.update({
      embeds: [crearEmbedFila(data)],
    });
  }

  // ===================== MAPEO MESAS =====================

  const mapping = {
    btn_f1: "f1",
    btn_f2: "f2",
    btn_f3: "f3",
  };

  const filaKey = mapping[interaction.customId];

  if (!filaKey) return;

  // ===================== EVITAR DOS MESAS =====================

  if (
    data.f1 === userId ||
    data.f2 === userId ||
    data.f3 === userId
  ) {
    if (data[filaKey] !== userId) {
      return interaction.reply({
        content: "⚠️ Ya estás sentado en una mesa.",
        ephemeral: true,
      });
    }
  }

  // ===================== SENTARSE / ENCONTRAR RIVAL =====================

  if (!data[filaKey]) {
    data[filaKey] = userId;

    await interaction.update({
      embeds: [crearEmbedFila(data)],
    });
  } else {
    if (data[filaKey] === userId) {
      return interaction.reply({
        content: "⚠️ Ya estás aquí.",
        ephemeral: true,
      });
    }

    const rivalId = data[filaKey];

    data[filaKey] = null;

    await interaction.update({
      embeds: [crearEmbedFila(data)],
    });

    await crearCanalPrivado(interaction, [
      rivalId,
      userId,
    ]);
  }
});

// ===================== CREAR CANAL PRIVADO =====================

async function crearCanalPrivado(interaction, jugadores) {
  const guild = interaction.guild;
  const parent = interaction.channel.parent;

  const nombres = jugadores
    .map(
      (id) =>
        guild.members.cache.get(id)?.user.username || "jugador"
    )
    .join("-vs-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);

  const canal = await guild.channels.create({
    name: `🃏┃${nombres}`,
    type: ChannelType.GuildText,
    parent,

    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },

      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },

      {
        id: EXTRA_MOD_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },

      ...jugadores.map((id) => ({
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
    content: `${jugadores
      .map((id) => `<@${id}>`)
      .join(" ")} | <@&${STAFF_ROLE_ID}> <@&${EXTRA_MOD_ROLE_ID}>`,

    embeds: [embedMatch],

    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("cerrar_partida")
          .setLabel("LEVANTAR MESA")
          .setEmoji("🤝")
          .setStyle(ButtonStyle.Danger)
      ),
    ],
  });

  await canal.send({
    embeds: [embedPagos()],
  });

  // Aviso automático al canal de intermediarios
  await avisarIntermediarios(interaction, jugadores, canal);
}

// ===================== BOT CONECTADO =====================

client.once("ready", () => {
  console.log(`🃏 Bot conectado: ${client.user.tag}`);
});

client.login(process.env.TOKEN);