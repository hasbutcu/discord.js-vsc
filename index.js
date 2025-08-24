const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Modül bilgileri
const MODULE_VERSION = '1.0.1'; // Updated version
const PACKAGE_NAME = 'discord.js-vsc';
const UPDATE_URL = 'https://github.com/hasbutcu/discord.js-vsc'; // Updated URL

// NPM'den en son sürümü çek
async function getLatestVersion() {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const packageInfo = JSON.parse(data);
          resolve(packageInfo.version);
        } catch (error) {
          resolve(MODULE_VERSION); // Hata durumunda mevcut sürümü döndür
        }
      });
    }).on('error', (error) => {
      resolve(MODULE_VERSION); // Hata durumunda mevcut sürümü döndür
    });
  });
}

// Sürüm kontrolü
async function checkVersion() {
  try {
    const latestVersion = await getLatestVersion();
    
    if (MODULE_VERSION !== latestVersion) {
      console.log('⚠️  GÜNCELLEME UYARISI!');
      console.log(`📦 Mevcut sürüm: ${MODULE_VERSION}`);
      console.log(`🆕 En son sürüm: ${latestVersion}`);
      console.log(`🔗 Güncellemek için: npm update ${PACKAGE_NAME}`);
      console.log('💡 Yeni özellikler ve hata düzeltmeleri için güncelleyin!');
    }
  } catch (error) {
    // Sessizce hata yönetimi
  }
}

// Sürüm kontrolünü çalıştır (asenkron)
checkVersion();

// Ana Oxy Sınıfı
class Oxy {
  constructor(client) {
    this.client = client;
    this.banSystem = null;
    this.sesSystem = null;
    this.durumRolSystem = null;
    this.welcomeSystem = null;
  }

  // Ban Sistemi
  ikiban(config = {}) {
    this.banSystem = new VSCBan(this.client);
    return this.banSystem.ayarlar(config);
  }

  // Ses Sistemi
  ses(config = {}) {
    this.sesSystem = new VSCSes(this.client);
    return this.sesSystem.ayarlar(config);
  }

  // Durum Rol Sistemi
  durumrol(config = {}) {
    this.durumRolSystem = new VSCDurumRol(this.client);
    return this.durumRolSystem.ayarlar(config);
  }

  // Welcome Sistemi
  welcome(config = {}) {
    this.welcomeSystem = new VSCWelcome(this.client);
    return this.welcomeSystem.ayarlar(config);
  }

  // Sürüm bilgileri
  getVersion() {
    return MODULE_VERSION;
  }

  async getLatestVersion() {
    return await getLatestVersion();
  }

  async isUpToDate() {
    const latest = await getLatestVersion();
    return MODULE_VERSION === latest;
  }

  async checkForUpdates() {
    try {
      const latestVersion = await getLatestVersion();
      
      if (MODULE_VERSION !== latestVersion) {
        console.log('⚠️  GÜNCELLEME UYARISI!');
        console.log(`📦 Mevcut sürüm: ${MODULE_VERSION}`);
        console.log(`🆕 En son sürüm: ${latestVersion}`);
        console.log(`🔗 Güncellemek için: npm update ${PACKAGE_NAME}`);
        console.log('💡 Yeni özellikler ve hata düzeltmeleri için güncelleyin!');
        return false;
      } else {
        console.log('✅ Modül güncel!');
        return true;
      }
    } catch (error) {
      console.log('❌ Sürüm kontrolü yapılamadı!');
      return true; // Hata durumunda güncel kabul et
    }
  }
}

// Ban Sistemi
class VSCBan {
  constructor(client) {
    this.client = client;
    this.mainServerId = null;
    this.yanServerId = null;
    this.banSebep = 'Ana sunucudan ayrıldığı için atıldı.';
    this.logChannelId = null;
    this.isEnabled = false;
    this.eventListenerAdded = false;
    this.action = 'ban'; // 'ban' veya 'kick'
    
    // Gerekli intent'ler
    this.requiredIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences
    ];
  }

  // Intent kontrolü
  checkIntents() {
    const missingIntents = [];
    
    this.requiredIntents.forEach(intent => {
      if (!this.client.options.intents.has(intent)) {
        missingIntents.push(intent);
      }
    });
    
    if (missingIntents.length > 0) {
      console.log('❌ EKSİK INTENT\'LER (Ban Sistemi):');
      missingIntents.forEach(intent => {
        console.log(`   - ${intent}`);
      });
      console.log('⚠️  Bu intent\'ler olmadan ban sistemi çalışmayacak!');
      return false;
    }
    
    return true;
  }

  // Sistemi yapılandır ve başlat
  ayarlar(config = {}) {
    this.mainServerId = config.main || this.mainServerId;
    this.yanServerId = config.yan || this.yanServerId;
    this.banSebep = config.bansebep || this.banSebep;
    this.logChannelId = config.log || this.logChannelId;
    this.action = config.action || 'ban'; // 'ban' veya 'kick'
    
    // Action kontrolü
    if (this.action !== 'ban' && this.action !== 'kick') {
      this.action = 'ban'; // Default olarak ban
    }
    
    // Intent kontrolü yap
    if (!this.checkIntents()) {
      return this;
    }
    
    this.isEnabled = true;
    
    // Bot hazır olduğunda event listener'ı ekle
    if (this.client.readyAt) {
      this.initializeEventListeners();
    } else {
      this.client.once('ready', () => {
        this.initializeEventListeners();
      });
    }
    
    return this;
  }

  initializeEventListeners() {
    if (this.eventListenerAdded) {
      return;
    }
    
    this.client.on(Events.GuildMemberRemove, async (member) => {
      await this.handleMemberLeave(member);
    });
    this.eventListenerAdded = true;
  }

  async handleMemberLeave(member) {
    if (!this.isEnabled || !this.mainServerId || !this.yanServerId) {
      return;
    }

    // Ana sunucudan ayrılan kullanıcıyı kontrol et
    if (member.guild.id === this.mainServerId) {
      // Yan sunucuyu bul
      const yanGuild = this.client.guilds.cache.get(this.yanServerId);
      
      if (yanGuild) {
        try {
          // Yan sunucuda kullanıcıyı bul ve işlem yap
          const yanMember = await yanGuild.members.fetch(member.id);
          
          // Ban veya kick işlemi
          if (this.action === 'ban') {
            await yanMember.ban({ reason: this.banSebep });
          } else {
            await yanMember.kick(this.banSebep);
          }
          
          // Log kanalına mesaj gönder
          await this.sendLog(member, yanGuild);
          
        } catch (error) {
          // Sessizce hata yönetimi
        }
      }
    }
  }

  async sendLog(member, yanGuild) {
    if (!this.logChannelId) {
      console.log('ℹ️ Log kanalı ID\'si ayarlanmamış, log gönderilmiyor.');
      return;
    }

    try {
      const logChannel = this.client.channels.cache.get(this.logChannelId);
      if (logChannel) {
        const actionText = this.action === 'ban' ? 'banlandı' : 'kicklendi';
        const actionEmoji = this.action === 'ban' ? '🚫' : '👢';
        
        const embed = {
          title: `${actionEmoji} ${this.action === 'ban' ? 'Ban' : 'Kick'} Log`,
          description: `Kullanıcı ana sunucudan ayrıldığı için yan sunucudan ${actionText}.`,
          color: this.action === 'ban' ? 0xff0000 : 0xffa500,
          fields: [
            { name: 'Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Yan Sunucu', value: yanGuild.name, inline: true },
            { name: 'İşlem', value: this.action === 'ban' ? 'Ban' : 'Kick', inline: true },
            { name: 'Sebep', value: this.banSebep, inline: false }
          ],
          timestamp: new Date()
        };

        await logChannel.send({ embeds: [embed] });
        console.log('✅ Log mesajı gönderildi.');
      } else {
        console.log('❌ Log kanalı bulunamadı.');
      }
    } catch (error) {
      console.error('❌ Log kanalına mesaj gönderilemedi:', error);
    }
  }
}

// Ses Sistemi
class VSCSes {
  constructor(client) {
    this.client = client;
    this.voiceChannelId = null;
    this.guildId = null;
    this.isEnabled = false;
    this.eventListenerAdded = false;
    
    // Gerekli intent'ler
    this.requiredIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates
    ];
  }

  // Intent kontrolü
  checkIntents() {
    const missingIntents = [];
    
    this.requiredIntents.forEach(intent => {
      if (!this.client.options.intents.has(intent)) {
        missingIntents.push(intent);
      }
    });
    
    if (missingIntents.length > 0) {
      console.log('❌ EKSİK INTENT\'LER (Ses Sistemi):');
      missingIntents.forEach(intent => {
        console.log(`   - ${intent}`);
      });
      console.log('⚠️  Bu intent\'ler olmadan ses sistemi çalışmayacak!');
      return false;
    }
    
    return true;
  }

  // Sistemi yapılandır ve başlat
  ayarlar(config = {}) {
    this.voiceChannelId = config.seskanali || config.voiceChannelId || this.voiceChannelId;
    this.guildId = config.sunucu || config.guildId || this.guildId;
    
    // Intent kontrolü yap
    if (!this.checkIntents()) {
      return this;
    }
    
    this.isEnabled = true;
    
    // Bot hazır olduğunda başlat
    if (this.client.readyAt) {
      this.initializeSystem();
    } else {
      this.client.once('ready', () => {
        this.initializeSystem();
      });
    }
    
    return this;
  }

  initializeSystem() {
    if (this.eventListenerAdded) {
      return;
    }
    
    // Ses kanalına bağlan
    this.joinVoiceChannel();
    
    // Voice state update event listener
    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });
    
    this.eventListenerAdded = true;
  }

  async joinVoiceChannel() {
    if (!this.voiceChannelId || !this.guildId) {
      return;
    }

    try {
      const guild = await this.client.guilds.fetch(this.guildId);
      const channel = await guild.channels.fetch(this.voiceChannelId);

      if (channel && channel.type === 2) { // 2 = GuildVoice
        this.connectToChannel(channel);
      }
    } catch (error) {
      console.error('❌ Ses kanalına bağlanırken bir hata oluştu:', error);
    }
  }

  connectToChannel(channel) {
    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      console.log(`🎵 Bot ${channel.name} kanalına bağlandı.`);
    } catch (error) {
      console.error('❌ Kanal bağlantısında bir hata oluştu:', error);
    }
  }

  handleVoiceStateUpdate(oldState, newState) {
    // Botun ses kanalından ayrıldığını kontrol et
    if (newState.id === this.client.user.id) {
      if (!newState.channelId) {
        // Bot ses kanalından ayrıldı, yeniden bağlanmayı dene
        setTimeout(() => {
          this.joinVoiceChannel();
        }, 2000); // 2 saniye bekle
      }
    }
  }
}

// Durum Rol Sistemi
class VSCDurumRol {
  constructor(client) {
    this.client = client;
    this.rolId = null;
    this.durum = null;
    this.logChannelId = null;
    this.guildId = null;
    this.isEnabled = false;
    this.eventListenerAdded = false;
    
    // Gerekli intent'ler
    this.requiredIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences
    ];
  }

  // Intent kontrolü
  checkIntents() {
    const missingIntents = [];
    
    this.requiredIntents.forEach(intent => {
      if (!this.client.options.intents.has(intent)) {
        missingIntents.push(intent);
      }
    });
    
    if (missingIntents.length > 0) {
      console.log('❌ EKSİK INTENT\'LER (Durum Rol Sistemi):');
      missingIntents.forEach(intent => {
        console.log(`   - ${intent}`);
      });
      console.log('⚠️  Bu intent\'ler olmadan durum rol sistemi çalışmayacak!');
      return false;
    }
    
    return true;
  }

  // Sistemi yapılandır ve başlat
  ayarlar(config = {}) {
    this.rolId = config.rolid || this.rolId;
    this.durum = config.durum || this.durum;
    this.logChannelId = config.log || this.logChannelId;
    this.guildId = config.guildid || this.guildId;
    
    // Intent kontrolü yap
    if (!this.checkIntents()) {
      return this;
    }
    
    this.isEnabled = true;
    
    // Bot hazır olduğunda event listener'ı ekle
    if (this.client.readyAt) {
      this.initializeEventListeners();
    } else {
      this.client.once('ready', () => {
        this.initializeEventListeners();
      });
    }
    
    return this;
  }

  initializeEventListeners() {
    if (this.eventListenerAdded) {
      return;
    }
    
    this.client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
      this.handlePresenceUpdate(oldPresence, newPresence);
    });
    this.eventListenerAdded = true;
    }

  handlePresenceUpdate(oldPresence, newPresence) {
    const member = newPresence.member;
    if (!member) return;

    // Bot'un kendisi değilse işlem yap
    if (member.user.id === this.client.user.id) return;

    // Sadece belirtilen sunucudaki değişiklikleri kontrol et
    if (member.guild.id !== this.guildId) {
      return; // Sessizce çık, log bile yazma
    }

    // Sadece CUSTOM_STATUS (type: 4) değişikliklerini kontrol et
    const oldCustomStatus = oldPresence.activities.find(activity => activity.type === 4);
    const newCustomStatus = newPresence.activities.find(activity => activity.type === 4);
    
    // Eğer özel durum değişmediyse işlem yapma
    const oldStatus = oldCustomStatus ? oldCustomStatus.state : '';
    const newStatus = newCustomStatus ? newCustomStatus.state : '';
    
    if (oldStatus === newStatus) {
      return; // Özel durum değişmedi, işlem yapma
    }

    // Kullanıcı görünmez değilse (online, idle, dnd) durumunu kontrol et
    if (['online', 'idle', 'dnd'].includes(member.presence?.status)) {
      if (newCustomStatus) {
        const userStatus = newStatus.trim();
        const presenceText = this.durum.trim();

        // Eski işleyiş: Durum içeriğinde belirli bir metin olup olmadığını kontrol et
        if (userStatus.includes(presenceText)) {
          if (!member.roles.cache.has(this.rolId)) {
            this.addRoleToMember(member);
          }
        } else {
          if (member.roles.cache.has(this.rolId)) {
            this.removeRoleFromMember(member);
          }
        }
      } else {
        // Özel durum yoksa rolü al
        if (member.roles.cache.has(this.rolId)) {
          this.removeRoleFromMember(member);
        }
      }
    }
  }

  async addRoleToMember(member) {
    if (!member.roles.cache.has(this.rolId)) {
      try {
        // Rol kontrolü
        const role = member.guild.roles.cache.get(this.rolId);
        if (!role) {
          console.error(`❌ Rol bulunamadı! ID: ${this.rolId}`);
          return;
        }
        
        // Yetki kontrolü
        if (!member.guild.members.me.permissions.has('ManageRoles')) {
          console.error('❌ Bot\'un rol yönetme yetkisi yok!');
          return;
        }
        
        // Rol hiyerarşisi kontrolü
        if (role.position >= member.guild.members.me.roles.highest.position) {
          console.error(`❌ Bot, ${role.name} rolünü veremez! Rol bot'tan daha yüksek.`);
          return;
        }
        
        await member.roles.add(this.rolId);
        this.sendRoleChangeEmbed(member, 'Rol Verildi!', `Hoş geldin! ${member.user.username}`, new Date());
      } catch (error) {
        console.error(`❌ Rol verilirken hata: ${error.message}`);
      }
    }
  }

  async removeRoleFromMember(member) {
    if (member.roles.cache.has(this.rolId)) {
      try {
        // Rol kontrolü
        const role = member.guild.roles.cache.get(this.rolId);
        if (!role) {
          console.error(`❌ Rol bulunamadı! ID: ${this.rolId}`);
          return;
        }
        
        // Yetki kontrolü
        if (!member.guild.members.me.permissions.has('ManageRoles')) {
          console.error('❌ Bot\'un rol yönetme yetkisi yok!');
          return;
        }
        
        // Rol hiyerarşisi kontrolü
        if (role.position >= member.guild.members.me.roles.highest.position) {
          console.error(`❌ Bot, ${role.name} rolünü alamaz! Rol bot'tan daha yüksek.`);
          return;
        }
        
        await member.roles.remove(this.rolId);
        this.sendRoleChangeEmbed(member, 'Rol Alındı!', `Üzgünüz! ${member.user.username}`, new Date());
      } catch (error) {
        console.error(`❌ Rol alınırken hata: ${error.message}`);
      }
    }
  }

  async sendRoleChangeEmbed(member, title, description, date) {
    if (!this.logChannelId) {
      return;
    }

    try {
      const role = member.guild.roles.cache.get(this.rolId);
      const roleName = role ? role.name : 'Rol Bulunamadı';

      const embed = {
        title: title,
        description: description,
        color: title === 'Rol Verildi!' ? 0x00ff00 : 0xff0000,
        fields: [
          { name: 'Üye', value: member.user.username, inline: true },
          { name: 'Rol Adı', value: roleName, inline: true }
        ],
        thumbnail: { url: member.user.displayAvatarURL({ format: 'png', dynamic: true }) },
        footer: { text: `Tarih: ${date.toLocaleString('tr-TR')}` },
        timestamp: new Date()
      };

      const logChannel = this.client.channels.cache.get(this.logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('❌ Log kanalına mesaj gönderilemedi:', error);
    }
  }
}

// Welcome Sistemi
class VSCWelcome {
  constructor(client) {
    this.client = client;
    this.hosgeldin = null;
    this.yetkili = null;
    this.arkaplan = null;
    this.seslikanalid = null;
    this.adminrolid = null;
    this.isEnabled = false;
    this.eventListenerAdded = false;
    this.voiceConnection = null;
    this.player = createAudioPlayer();
    this.currentLoop = '';
    
    // Gerekli intent'ler
    this.requiredIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers
    ];
  }

  // Intent kontrolü
  checkIntents() {
    const missingIntents = [];
    
    this.requiredIntents.forEach(intent => {
      if (!this.client.options.intents.has(intent)) {
        missingIntents.push(intent);
      }
    });
    
    if (missingIntents.length > 0) {
      console.log('❌ EKSİK INTENT\'LER (Welcome Sistemi):');
      missingIntents.forEach(intent => {
        console.log(`   - ${intent}`);
      });
      console.log('⚠️  Bu intent\'ler olmadan welcome sistemi çalışmayacak!');
      return false;
    }
    
    return true;
  }

  // Sistemi yapılandır ve başlat
  ayarlar(config = {}) {
    this.hosgeldin = config.hosgeldin || this.hosgeldin;
    this.yetkili = config.yetkili || this.yetkili;
    this.arkaplan = config.arkaplan || this.arkaplan;
    this.seslikanalid = config.seslikanalid || this.seslikanalid;
    this.adminrolid = config.adminrolid || this.adminrolid;
    
    // Intent kontrolü yap
    if (!this.checkIntents()) {
      return this;
    }
    
    this.isEnabled = true;
    
    // Bot hazır olduğunda başlat
    if (this.client.readyAt) {
      this.initializeSystem();
    } else {
      this.client.once('ready', () => {
        this.initializeSystem();
      });
    }
    
    return this;
  }

  initializeSystem() {
    if (this.eventListenerAdded) {
      return;
    }
    
    // Ses kanalına bağlan
    this.joinVoiceChannel();
    
    // Voice state update event listener
    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });
    
    // Player event listeners
    this.player.on('error', error => {
      console.error('❌ Ses oynatma sırasında hata:', error);
    });


    
    this.eventListenerAdded = true;
  }

  async joinVoiceChannel() {
    if (!this.seslikanalid) {
      console.log('⚠️ Ses kanalı ID\'si ayarlanmamış.');
      return;
    }

    try {
      const channel = this.client.channels.cache.get(this.seslikanalid);
      if (!channel || channel.type !== 2) { // 2 = GuildVoice
        console.error('❌ Geçerli bir ses kanalı bulunamadı.');
        return;
      }

      this.voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Arkaplan sesini çal
      this.playBackgroundAudio();
      
      console.log(`🎵 Bot ${channel.name} kanalına bağlandı.`);
    } catch (error) {
      console.error('❌ Ses kanalına bağlanırken bir hata oluştu:', error);
    }
  }

  playBackgroundAudio() {
    if (!this.arkaplan) {
      console.log('⚠️ Arkaplan ses dosyası ayarlanmamış.');
      return;
    }

    if (!fs.existsSync(this.arkaplan)) {
      console.error(`❌ Arkaplan ses dosyası bulunamadı: ${this.arkaplan}`);
      return;
    }

    const silence = createAudioResource(this.arkaplan);
    this.player.play(silence);
    this.voiceConnection.subscribe(this.player);
  }

  playAudioOnce(type) {
    const audioPath = type === 'hosgeldin' ? this.hosgeldin : this.yetkili;
    
    if (!audioPath || !fs.existsSync(audioPath)) {
      console.error(`❌ ${type}.mp3 dosyası bulunamadı: ${audioPath}`);
      return;
    }

    const audio = createAudioResource(audioPath);
    this.player.play(audio);

    this.player.once(AudioPlayerStatus.Idle, () => {
      // Ses bittikten sonra arkaplan sesine dön
      this.playBackgroundAudio();
    });
  }

  checkChannelAndUpdateAudio(channel) {
    const membersInChannel = channel.members.filter(m => !m.user.bot);
    const hasYetkili = membersInChannel.some(member => 
      member.roles.cache.has(this.adminrolid)
    );

    // Kanal durumunu kontrol et
    const currentState = hasYetkili ? 'yetkili' : (membersInChannel.size > 0 ? 'hosgeldin' : 'bos');

    // Eğer durum değiştiyse ses çal
    if (this.currentLoop !== currentState) {
      this.currentLoop = currentState;
      
      if (hasYetkili) {
        this.playAudioOnce('yetkili');
      } else if (membersInChannel.size > 0) {
        this.playAudioOnce('hosgeldin');
      } else {
        this.playBackgroundAudio();
      }
    }
  }

  handleVoiceStateUpdate(oldState, newState) {
    if (!this.seslikanalid) return;

    const targetChannelId = this.seslikanalid;
    const channel = newState.guild.channels.cache.get(targetChannelId);
    
    if (!channel) return;

    // Aynı kanalda başka bot var mı kontrol et
    const botsInChannel = channel.members.filter(m => 
      m.user.bot && m.user.id !== this.client.user.id
    );

    if (botsInChannel.size > 0) {
      console.log('⚠️ Aynı kanalda başka bir bot var, işlem durduruldu.');
      return;
    }

    if (newState.channelId === targetChannelId || oldState.channelId === targetChannelId) {
      setTimeout(() => {
        this.checkChannelAndUpdateAudio(channel);
      }, 2000);
    }
  }
}

// Modül export'ları
module.exports = Oxy;
module.exports.Oxy = Oxy;
module.exports.vsc = VSCBan;
module.exports.ses = VSCSes;
module.exports.durumrol = VSCDurumRol;
module.exports.welcome = VSCWelcome;

// Sürüm bilgileri
module.exports.VERSION = MODULE_VERSION;
module.exports.PACKAGE_NAME = PACKAGE_NAME;
module.exports.UPDATE_URL = UPDATE_URL;
