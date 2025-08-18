# 🚀 VSC Discord Bot Modülü

Discord botları için geliştirilmiş kapsamlı bir modül. Ban sistemi, ses sistemi ve durum rol sistemi gibi özellikleri içerir.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.3+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.14.1+-blue.svg)](https://discord.js.org/)
[![GitHub stars](https://img.shields.io/github/stars/hasbutcu/discord.js-vsc?style=social&cache=1)](https://github.com/hasbutcu/discord.js-vsc)
[![GitHub forks](https://img.shields.io/github/forks/hasbutcu/discord.js-vsc?style=social&cache=1)](https://github.com/hasbutcu/discord.js-vsc)
[![NPM version](https://img.shields.io/npm/v/discord.js-vsc.svg?cache=1)](https://www.npmjs.com/package/discord.js-vsc)
[![NPM downloads](https://img.shields.io/npm/dm/discord.js-vsc.svg?cache=1)](https://www.npmjs.com/package/discord.js-vsc)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Kurulum](#-kurulum)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Detaylı Kullanım](#-detaylı-kullanım)
- [Örnekler](#-örnekler)
- [Hata Yönetimi](#️-hata-yönetimi)
- [Sürüm Kontrolü](#-sürüm-kontrolü)
- [Lisans](#-lisans)
- [Destek](#-destek)

## ✨ Özellikler

### 🛡️ Ban Sistemi (`ikiban()`)
- **Otomatik Ban/Kick**: Ana sunucudan ayrılan kullanıcıları otomatik olarak yan sunucudan banlar/kickler
- **Çapraz Sunucu Yönetimi**: Farklı sunucular arası ban sistemi
- **Özelleştirilebilir Sebepler**: Ban sebebini özelleştirebilirsiniz
- **Log Sistemi**: Ban işlemlerini belirtilen kanala loglar
- **Ban/Kick Seçeneği**: İstediğiniz işlemi seçebilirsiniz

### 🎵 Ses Sistemi (`ses()`)
- **Otomatik Bağlanma**: Bot belirtilen ses kanalına otomatik bağlanır
- **Otomatik Yeniden Bağlanma**: Bağlantı kesildiğinde otomatik olarak yeniden bağlanır
- **Ses Kanalı Yönetimi**: Ses kanallarını kolayca yönetebilirsiniz

### 🏷️ Durum Rol Sistemi (`durumrol()`)
- **Otomatik Rol Verme**: Kullanıcının özel durumuna göre otomatik rol verir
- **Gerçek Zamanlı İzleme**: Durum değişikliklerini anında takip eder
- **Özel Durum Eşleştirme**: Belirttiğiniz metni içeren durumlara rol verir
- **Log Sistemi**: Rol verme/alma işlemlerini loglar

## 📦 Kurulum

### Gereksinimler
- Node.js 20.19.3 veya üzeri
- Discord.js 14.14.1 veya üzeri
- Discord Bot Token'ı

### Modülü Yükleme
```bash
npm install discord.js-vsc
```

### Discord Bot Oluşturma
1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. "New Application" butonuna tıklayın
3. Bot sekmesine gidin ve "Add Bot" butonuna tıklayın
4. Token'ı kopyalayın ve güvenli bir yerde saklayın
5. Gerekli izinleri verin (aşağıda listelenmiştir)

## 🚀 Hızlı Başlangıç

### Temel Kurulum
```javascript
const Oxy = require('discord.js-vsc');
const { Client, GatewayIntentBits } = require('discord.js');

// Discord client'ını oluştur
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// VSC modülünü başlat
const bot = new Oxy(client);

// Sistemleri yapılandır
bot.ikiban({
  main: 'ANA_SUNUCU_ID',
  yan: 'YAN_SUNUCU_ID',
  bansebep: 'Ana sunucudan ayrıldığı için atıldı.',
  log: 'LOG_KANAL_ID',
  action: 'ban'
});

bot.ses({
  seskanali: 'SES_KANAL_ID',
  sunucu: 'SUNUCU_ID'
});

bot.durumrol({
  guildid: 'SUNUCU_ID',
  rolid: 'ROL_ID',
  durum: 'vsc',
  log: 'LOG_KANAL_ID'
});

// Bot'u başlat
client.login('BOT_TOKEN');
```

## 📖 Detaylı Kullanım

### 🛡️ Ban Sistemi Detayları

#### Parametreler
- `main` (zorunlu): Ana sunucu ID'si
- `yan` (zorunlu): Yan sunucu ID'si
- `bansebep` (opsiyonel): Ban sebebi (varsayılan: "Ana sunucudan ayrıldığı için atıldı.")
- `log` (opsiyonel): Log kanalı ID'si
- `action` (opsiyonel): İşlem türü - "ban" veya "kick" (varsayılan: "ban")

#### Nasıl Çalışır?
1. Kullanıcı ana sunucudan ayrılır
2. Sistem otomatik olarak yan sunucuda kullanıcıyı arar
3. Kullanıcı bulunursa belirtilen işlemi (ban/kick) yapar
4. Log kanalı belirtilmişse işlemi loglar

#### Örnek Kullanım
```javascript
bot.ikiban({
  main: '1234567890123456789',      // Ana sunucu
  yan: '9876543210987654321',       // Yan sunucu
  bansebep: 'Ana sunucudan ayrıldığı için atıldı.',
  log: '1234567890123456789',       // Log kanalı
  action: 'ban'                     // Ban işlemi
});
```

### 🎵 Ses Sistemi Detayları

#### Parametreler
- `seskanali` (zorunlu): Ses kanalı ID'si
- `sunucu` (zorunlu): Sunucu ID'si

#### Nasıl Çalışır?
1. Bot başlatıldığında belirtilen ses kanalına otomatik bağlanır
2. Bağlantı kesildiğinde 2 saniye bekler ve yeniden bağlanmaya çalışır
3. Sürekli olarak bağlantı durumunu kontrol eder

#### Örnek Kullanım
```javascript
bot.ses({
  seskanali: '1234567890123456789', // Ses kanalı ID'si
  sunucu: '1234567890123456789'     // Sunucu ID'si
});
```

### 🏷️ Durum Rol Sistemi Detayları

#### Parametreler
- `guildid` (zorunlu): Sunucu ID'si
- `rolid` (zorunlu): Verilecek rol ID'si
- `durum` (zorunlu): Aranacak durum metni
- `log` (opsiyonel): Log kanalı ID'si

#### Nasıl Çalışır?
1. Kullanıcının özel durumu değiştiğinde sistem kontrol eder
2. Durum içeriğinde belirtilen metin varsa rol verir
3. Metin yoksa rolü alır
4. Log kanalı belirtilmişse işlemi loglar

#### Örnek Kullanım
```javascript
bot.durumrol({
  guildid: '1234567890123456789',   // Sunucu ID'si
  rolid: '1234567890123456789',     // Rol ID'si
  durum: 'vsc',                     // Aranacak metin
  log: '1234567890123456789'        // Log kanalı
});
```

## 💡 Örnekler

### Tam Örnek Proje
```javascript
const Oxy = require('discord.js-vsc');
const { Client, GatewayIntentBits } = require('discord.js');

// Bot token'ınızı buraya yazın
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Discord client'ını oluştur
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// VSC modülünü başlat
const bot = new Oxy(client);

// Ban Sistemi - Ana sunucudan ayrılanları yan sunucudan banla
bot.ikiban({
  main: '1406592502810542140',           // Ana sunucu
  yan: '1406998013192179893',            // Yan sunucu
  bansebep: 'Ana sunucudan ayrıldığı için atıldı.',
  log: '1406592834227929130',            // Log kanalı
  action: 'ban'                          // Ban işlemi
});

// Ses Sistemi - Belirtilen ses kanalına otomatik bağlan
bot.ses({
  seskanali: '1406602193670373467',      // Ses kanalı
  sunucu: '1406592502810542140'          // Sunucu
});

// Durum Rol Sistemi - "vsc" yazanlara rol ver
bot.durumrol({
  guildid: '1406592502810542140',        // Sunucu
  rolid: '1406593872254992507',          // Rol
  durum: 'vsc',                          // Aranacak metin
  log: '1406592834227929130'             // Log kanalı
});

// Bot hazır olduğunda
client.on('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
  console.log('VSC Sistemleri aktif!');
  
  // Sunucuları listele
  console.log('Bot bulunduğu sunucular:');
  client.guilds.cache.forEach(guild => {
    console.log(`- ${guild.name} (${guild.id})`);
  });
});

// Hata yakalama
client.on('error', (error) => {
  console.error('Bot hatası:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Yakalanmamış hata:', error);
});

// Bot'u başlat
client.login(BOT_TOKEN);
```

### Farklı Konfigürasyon Örnekleri

#### Sadece Ban Sistemi
```javascript
const bot = new Oxy(client);

bot.ikiban({
  main: 'ANA_SUNUCU_ID',
  yan: 'YAN_SUNUCU_ID'
});
```

#### Sadece Ses Sistemi
```javascript
const bot = new Oxy(client);

bot.ses({
  seskanali: 'SES_KANAL_ID',
  sunucu: 'SUNUCU_ID'
});
```

#### Sadece Durum Rol Sistemi
```javascript
const bot = new Oxy(client);

bot.durumrol({
  guildid: 'SUNUCU_ID',
  rolid: 'ROL_ID',
  durum: 'vsc'
});
```

## ⚠️ Hata Yönetimi

### Gerekli İzinler
Bot'un aşağıdaki izinlere sahip olması gerekir:

#### Ban Sistemi İçin:
- `Ban Members` - Kullanıcıları banlamak için
- `Kick Members` - Kullanıcıları kicklemek için
- `Send Messages` - Log mesajları göndermek için
- `Embed Links` - Embed mesajları göndermek için

#### Ses Sistemi İçin:
- `Connect` - Ses kanallarına bağlanmak için
- `Speak` - Ses kanalında konuşmak için

#### Durum Rol Sistemi İçin:
- `Manage Roles` - Rolleri yönetmek için
- `Send Messages` - Log mesajları göndermek için
- `Embed Links` - Embed mesajları göndermek için

### Intent Gereksinimleri
```javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Sunucu bilgileri
    GatewayIntentBits.GuildMembers,     // Üye bilgileri
    GatewayIntentBits.GuildPresences,   // Durum bilgileri
    GatewayIntentBits.GuildVoiceStates, // Ses durumları
    GatewayIntentBits.GuildMessages,    // Mesaj bilgileri
    GatewayIntentBits.MessageContent    // Mesaj içerikleri
  ]
});
```

### Yaygın Hatalar ve Çözümleri

#### "Missing Permissions" Hatası
- Bot'un gerekli izinlere sahip olduğundan emin olun
- Bot'un rolünün yeterince yüksek olduğunu kontrol edin

#### "Unknown Role" Hatası
- Rol ID'sinin doğru olduğundan emin olun
- Rolün sunucuda mevcut olduğunu kontrol edin

#### "Channel Not Found" Hatası
- Kanal ID'sinin doğru olduğundan emin olun
- Bot'un kanala erişim izninin olduğunu kontrol edin

## 🔄 Sürüm Kontrolü

Modül otomatik olarak NPM registry'den güncellemeleri kontrol eder.

### Sürüm Bilgilerini Kontrol Etme
```javascript
const Oxy = require('discord.js-vsc');

// Mevcut sürümü göster
console.log('Mevcut sürüm:', Oxy.VERSION);

// Bot instance ile kontrol
const bot = new Oxy(client);

// Manuel güncelleme kontrolü
(async () => {
  const isUpToDate = await bot.isUpToDate();
  if (!isUpToDate) {
    console.log('Güncelleme mevcut!');
    await bot.checkForUpdates();
  }
})();
```

### Güncelleme Mesajları
```
⚠️  GÜNCELLEME UYARISI!
📦 Mevcut sürüm: 1.0.0
🆕 En son sürüm: 1.1.0
🔗 Güncellemek için: npm update discord.js-vsc
💡 Yeni özellikler ve hata düzeltmeleri için güncelleyin!
```

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

### Atıf Gereksinimleri
Bu kodu kullanırken, değiştirirken veya dağıtırken şunları dahil etmelisiniz:
- **Yazar**: hasbutcu
- **Repository**: https://github.com/hasbutcu/discord.js-vsc
- **Copyright**: Copyright (c) 2025 hasbutcu

**Orijinal kodun sahipliğini iddia etmeyin. Her zaman orijinal yazara uygun kredi verin.**

## 🆘 Destek

### Sorun Bildirme
Bir hata bulduysanız veya öneriniz varsa:
1. [GitHub Issues](https://github.com/hasbutcu/discord.js-vsc/issues) sayfasına gidin
2. Yeni bir issue oluşturun
3. Hata detaylarını ve kod örneklerini paylaşın

### İletişim
- **Discord**: hasbutcu
- **GitHub**: [@hasbutcu](https://github.com/hasbutcu)

### Sık Sorulan Sorular

#### Q: Bot neden ses kanalına bağlanmıyor?
A: Bot'un "Connect" ve "Speak" izinlerinin olduğundan emin olun.

#### Q: Ban sistemi çalışmıyor, ne yapmalıyım?
A: Bot'un "Ban Members" izninin olduğunu ve rolünün yeterince yüksek olduğunu kontrol edin.

#### Q: Durum rol sistemi çalışmıyor?
A: Bot'un "Manage Roles" izninin olduğunu ve rolünün verilecek rolden yüksek olduğunu kontrol edin.

#### Q: Log mesajları gelmiyor?
A: Bot'un log kanalında "Send Messages" ve "Embed Links" izinlerinin olduğunu kontrol edin.

## 🔗 Faydalı Linkler

- [Discord.js Dokümantasyonu](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Node.js İndirme](https://nodejs.org/)
- [NPM Registry](https://www.npmjs.com/)

## 📊 Proje İstatistikleri

[![GitHub stars](https://img.shields.io/github/stars/hasbutcu/discord.js-vsc?style=social&cache=1)](https://github.com/hasbutcu/discord.js-vsc)
[![GitHub forks](https://img.shields.io/github/forks/hasbutcu/discord.js-vsc?style=social&cache=1)](https://github.com/hasbutcu/discord.js-vsc)
[![GitHub issues](https://img.shields.io/github/issues/hasbutcu/discord.js-vsc?cache=1)](https://github.com/hasbutcu/discord.js-vsc/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/hasbutcu/discord.js-vsc?cache=1)](https://github.com/hasbutcu/discord.js-vsc/pulls)
[![NPM downloads](https://img.shields.io/npm/dm/discord.js-vsc?cache=1)](https://www.npmjs.com/package/discord.js-vsc)

---

**VSC Discord Bot Modülü v1.0.0** - ❤️ ile hasbutcu tarafından geliştirildi

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
