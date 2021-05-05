export const Elem = {
    DocNode: 'KeePassFile',

    Meta: 'Meta',
    Root: 'Root',
    Group: 'Group',
    Entry: 'Entry',

    Generator: 'Generator',
    HeaderHash: 'HeaderHash',
    SettingsChanged: 'SettingsChanged',
    DbName: 'DatabaseName',
    DbNameChanged: 'DatabaseNameChanged',
    DbDesc: 'DatabaseDescription',
    DbDescChanged: 'DatabaseDescriptionChanged',
    DbDefaultUser: 'DefaultUserName',
    DbDefaultUserChanged: 'DefaultUserNameChanged',
    DbMntncHistoryDays: 'MaintenanceHistoryDays',
    DbColor: 'Color',
    DbKeyChanged: 'MasterKeyChanged',
    DbKeyChangeRec: 'MasterKeyChangeRec',
    DbKeyChangeForce: 'MasterKeyChangeForce',
    RecycleBinEnabled: 'RecycleBinEnabled',
    RecycleBinUuid: 'RecycleBinUUID',
    RecycleBinChanged: 'RecycleBinChanged',
    EntryTemplatesGroup: 'EntryTemplatesGroup',
    EntryTemplatesGroupChanged: 'EntryTemplatesGroupChanged',
    HistoryMaxItems: 'HistoryMaxItems',
    HistoryMaxSize: 'HistoryMaxSize',
    LastSelectedGroup: 'LastSelectedGroup',
    LastTopVisibleGroup: 'LastTopVisibleGroup',

    MemoryProt: 'MemoryProtection',
    ProtTitle: 'ProtectTitle',
    ProtUserName: 'ProtectUserName',
    ProtPassword: 'ProtectPassword',
    ProtUrl: 'ProtectURL',
    ProtNotes: 'ProtectNotes',

    CustomIcons: 'CustomIcons',
    CustomIconItem: 'Icon',
    CustomIconItemID: 'UUID',
    CustomIconItemData: 'Data',
    CustomIconItemName: 'Name',

    AutoType: 'AutoType',
    History: 'History',

    Name: 'Name',
    Notes: 'Notes',
    Uuid: 'UUID',
    Icon: 'IconID',
    CustomIconID: 'CustomIconUUID',
    FgColor: 'ForegroundColor',
    BgColor: 'BackgroundColor',
    OverrideUrl: 'OverrideURL',
    Times: 'Times',
    Tags: 'Tags',
    QualityCheck: 'QualityCheck',
    PreviousParentGroup: 'PreviousParentGroup',

    CreationTime: 'CreationTime',
    LastModTime: 'LastModificationTime',
    LastAccessTime: 'LastAccessTime',
    ExpiryTime: 'ExpiryTime',
    Expires: 'Expires',
    UsageCount: 'UsageCount',
    LocationChanged: 'LocationChanged',

    GroupDefaultAutoTypeSeq: 'DefaultAutoTypeSequence',
    EnableAutoType: 'EnableAutoType',
    EnableSearching: 'EnableSearching',

    String: 'String',
    Binary: 'Binary',
    Key: 'Key',
    Value: 'Value',

    AutoTypeEnabled: 'Enabled',
    AutoTypeObfuscation: 'DataTransferObfuscation',
    AutoTypeDefaultSeq: 'DefaultSequence',
    AutoTypeItem: 'Association',
    Window: 'Window',
    KeystrokeSequence: 'KeystrokeSequence',

    Binaries: 'Binaries',

    IsExpanded: 'IsExpanded',
    LastTopVisibleEntry: 'LastTopVisibleEntry',

    DeletedObjects: 'DeletedObjects',
    DeletedObject: 'DeletedObject',
    DeletionTime: 'DeletionTime',

    CustomData: 'CustomData',
    StringDictExItem: 'Item'
} as const;

export const Attr = {
    Id: 'ID',
    Ref: 'Ref',
    Protected: 'Protected',
    ProtectedInMemPlainXml: 'ProtectInMemory',
    Compressed: 'Compressed'
} as const;

export const Val = {
    False: 'False',
    True: 'True'
} as const;
