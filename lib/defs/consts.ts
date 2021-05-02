export const Signatures = {
    FileMagic: 0x9aa2d903,
    Sig2Kdbx: 0xb54bfb67,
    Sig2Kdb: 0xb54bfb65
} as const;

export const ErrorCodes = {
    NotImplemented: 'NotImplemented',
    InvalidArg: 'InvalidArg',
    BadSignature: 'BadSignature',
    InvalidVersion: 'InvalidVersion',
    Unsupported: 'Unsupported',
    FileCorrupt: 'FileCorrupt',
    InvalidKey: 'InvalidKey',
    MergeError: 'MergeError',
    InvalidState: 'InvalidState'
} as const;

export const CompressionAlgorithm = {
    None: 0,
    GZip: 1
} as const;

export const CrsAlgorithm = {
    Null: 0,
    ArcFourVariant: 1,
    Salsa20: 2,
    ChaCha20: 3
} as const;

export const KdfId = {
    Argon2: '72Nt34wpREuR96mkA+MKDA==',
    Argon2d: '72Nt34wpREuR96mkA+MKDA==',
    Argon2id: 'nimLGVbbR3OyPfw+xvCh5g==',
    Aes: 'ydnzmmKKRGC/dA0IwYpP6g=='
} as const;

export const CipherId = {
    Aes: 'McHy5r9xQ1C+WAUhavxa/w==',
    ChaCha20: '1gOKK4tvTLWlJDOaMdu1mg=='
} as const;

export const AutoTypeObfuscationOptions = {
    None: 0,
    UseClipboard: 1
} as const;

export const Defaults = {
    KeyEncryptionRounds: 300000,
    MntncHistoryDays: 365,
    HistoryMaxItems: 10,
    HistoryMaxSize: 6 * 1024 * 1024,
    RecycleBinName: 'Recycle Bin'
} as const;

export const Icons = {
    Key: 0,
    World: 1,
    Warning: 2,
    NetworkServer: 3,
    MarkedDirectory: 4,
    UserCommunication: 5,
    Parts: 6,
    Notepad: 7,
    WorldSocket: 8,
    Identity: 9,
    PaperReady: 10,
    Digicam: 11,
    IRCommunication: 12,
    MultiKeys: 13,
    Energy: 14,
    Scanner: 15,
    WorldStar: 16,
    CDRom: 17,
    Monitor: 18,
    EMail: 19,
    Configuration: 20,
    ClipboardReady: 21,
    PaperNew: 22,
    Screen: 23,
    EnergyCareful: 24,
    EMailBox: 25,
    Disk: 26,
    Drive: 27,
    PaperQ: 28,
    TerminalEncrypted: 29,
    Console: 30,
    Printer: 31,
    ProgramIcons: 32,
    Run: 33,
    Settings: 34,
    WorldComputer: 35,
    Archive: 36,
    Homebanking: 37,
    DriveWindows: 39,
    Clock: 39,
    EMailSearch: 40,
    PaperFlag: 41,
    Memory: 42,
    TrashBin: 43,
    Note: 44,
    Expired: 45,
    Info: 46,
    Package: 47,
    Folder: 48,
    FolderOpen: 49,
    FolderPackage: 50,
    LockOpen: 51,
    PaperLocked: 52,
    Checked: 53,
    Pen: 54,
    Thumbnail: 55,
    Book: 56,
    List: 57,
    UserKey: 58,
    Tool: 59,
    Home: 60,
    Star: 61,
    Tux: 62,
    Feather: 63,
    Apple: 64,
    Wiki: 65,
    Money: 66,
    Certificate: 67,
    BlackBerry: 68
} as const;
