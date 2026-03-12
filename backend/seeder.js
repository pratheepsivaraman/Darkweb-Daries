const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Level = require('./models/Level');

dotenv.config();

const levels = [
  {
    levelNumber: 1,
    title: 'Hex Decoder',
    question: 'Decode the following to find the key.',
    clue: 'Clue1: 67 6F 6F 67 6C 65\nClue2: Each pair represents a hexadecimal ASCII character',
    answer: 'google',
    thresholdTime: 300, // 5 minutes
    maxPoints: 100,
    content: {
       hexData: '67 6F 6F 67 6C 65'
    }
  },
  {
    levelNumber: 2,
    title: 'Server Breach Time Drift',
    question: 'Analyze the access logs. Who caused the time drift?',
    clue: 'Look for discrepancies in the synchronization events before 04:00 AM.',
    answer: 'User A',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
       logs: [
           "[03:45:00] User A connected via SSH",
           "[03:45:12] User B connected via VPN",
           "[03:46:01] System clock synchronized (offset -2ms)",
           "[03:52:19] User A executed 'ntpdate'",
           "[04:01:05] Alert: Server time drift detected (+400s)"
       ]
    }
  },
  {
    levelNumber: 3,
    title: 'Jumbled Packet Recovery',
    question: 'A malicious packet was captured. Unjumble the payload to find the malware signature.',
    clue: 'It is a 7-letter word related to malicious software.',
    answer: 'MALWARE',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
       letters: ['W', 'A', 'M', 'L', 'A', 'R', 'E']
    }
  },
  {
    levelNumber: 4,
    title: 'Hidden Letters Image',
    question: 'Examine the image metadata or structure to find the hidden string.',
    clue: 'The letters are hidden in the least significant bits of the image. What does it spell?',
    answer: 'Cloudsecurity',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
       text: 'Imagine there is an image here with hidden text: Cloudsecurity' // Mocking for now since we build a frontend text display or just use text
    }
  },
  {
    levelNumber: 5,
    title: 'Advanced Log Analysis',
    question: 'Which process spawned the unauthorized connection at 11:23 PM?',
    clue: 'Trace the parent PID of the bash shell created at 11:23:01.',
    answer: 'sys_backup',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
        syslog: "11:22:58 daemon.info systemd[1]: Started cron task.\n11:23:01 auth.info sshd[4012]: Accepted. Parent PID: 4001 (sys_backup)\n11:23:02 user.warn bash: root login on pts/0"
    }
  },
  {
    levelNumber: 6,
    title: 'Binary Payload Analysis',
    question: 'Convert the binary payload back to text to understand the vulnerability.',
    clue: 'Each 8 bits is an ASCII character.',
    answer: 'SQL Injection',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
        binary: '01010011 01010001 01001100 00100000 01001001 01101110 01101010 01100101 01100011 01110100 01101001 01101111 01101110'
    }
  },
  {
    levelNumber: 7,
    title: 'Email Attack',
    question: 'Based on the email headers, what type of attack is this?',
    clue: 'The sender address is spoofed and contains malicious links.',
    answer: 'Spam',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
        headers: "From: admin@paypal-secure-login-update.com\nTo: user@company.com\nSubject: Action Required: Update your billing info\nReceived: from unknown (192.168.1.100) by mail.company.com"
    }
  },
  {
    levelNumber: 8,
    title: 'Murder Mystery Logic',
    question: 'Who is the culprit?',
    clue: 'If Alice was at the firewall, and Bob was patching the DB... then the only one with access to the server room was...',
    answer: 'Marcus',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
        scenario: "The server room was breached at midnight.\nAlice: 'I was configuring the firewall rules remote.'\nBob: 'I was applying patches to the DB.'\nMarcus: 'I was sleeping in the breakroom.'\nSecurity cameras show someone exiting the breakroom and using physical keys."
    }
  },
  {
    levelNumber: 9,
    title: 'Morse Code',
    question: 'Decode the intercepted signal.',
    clue: 'Audio signals can be represented as dots and dashes.',
    answer: 'HACKER',
    thresholdTime: 300,
    maxPoints: 100,
    content: {
        signal: '.... .- -.-. -.- . .-.'
    }
  },
  {
    levelNumber: 10,
    title: 'Hash Identification',
    question: 'Identify the underlying plain text for the given MD5 hash.',
    clue: 'It is one of the most common passwords in the world.',
    answer: 'password',
    thresholdTime: 600, // 10 minutes for final level
    maxPoints: 200,
    content: {
        hash: '5f4dcc3b5aa765d61d8327deb882cf99'
    }
  }
];

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
};

const importData = async () => {
  try {
    await connectDB();
    await Level.deleteMany();
    await Level.insertMany(levels);
    console.log('Levels Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
