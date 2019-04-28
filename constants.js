
/* Mach-O Magic Numbers */
var MH_MAGIC = 0xfeedface;
var MH_CIGAM = 0xcefaedfe;
var MH_MAGIC_64 = 0xfeedfacf;
var MH_CIGAM_64 = 0xcffaedfe;

/* Mach-O Cpu Types */
var CPU_ARCH_ABI64 = 0x01000000;
var CPU_TYPE_VAX = 0x00000001;
var CPU_TYPE_MC680X0 = 0x00000006;
var CPU_TYPE_I386 = 0x00000007;
var CPU_TYPE_X86_64 = CPU_ARCH_ABI64 | CPU_TYPE_I386;
var CPU_TYPE_MC98000 = 0x0a;
var CPU_TYPE_HPPA = 0x0b;
var CPU_TYPE_ARM = 0x0c;
var CPU_TYPE_ARM64 = CPU_ARCH_ABI64 | CPU_TYPE_ARM64;
var CPU_TYPE_ARM64_32 = 0x0200000c;
var CPU_TYPE_MC88000 = 0x0d;
var CPU_TYPE_SPARC = 0x0e;
var CPU_TYPE_I860 = 0x0f;
var CPU_TYPE_ALPHA = 0x10;
var CPU_TYPE_POWERPC = 0x12;
var CPU_TYPE_POWERPC64 = CPU_ARCH_ABI64 | CPU_TYPE_POWERPC;

/* Mach-O Cpu Subtypes */
var CPU_SUBTYPE_MASK = 0x00ffffff;
var CPU_SUBTYPE_VAX_ALL = 0x0;
var CPU_SUBTYPE_VAX_780 = 0x1;
var CPU_SUBTYPE_VAX_785 = 0x2;
var CPU_SUBTYPE_VAX_750 = 0x3;
var CPU_SUBTYPE_VAX_730 = 0x4;

var CPU_SUBTYPE_LIB64 = 0x80000000;
var CPU_SUBTYPE_I386_ALL = 0x00000003;


/* Endianess */
var ENDIANESS_MULTI = 0xffffffff;
var ENDIANESS_LSB = 0x0;
var ENDIANESS_MSB = 0x1;

/* Mach-O Flags */
var MH_EXECUTE = 2;
var MH_OBJECT = 1;
var MH_FVMLIB = 3;
var MH_CORE = 4;
var MH_PRELOAD = 5;
var MH_DYLIB = 6;
var MH_DYLINKER = 7;
var MH_BUNDLE = 8;
var MH_DYLIB_STUB = 9;
var MH_DSYM = 10;
var MH_KEXT = 11;

var MH_NOUNDEFS = 0x1;
var MH_INCRLINK = 0x2;
var MH_DYLDLINK = 0x4;


/* Mach-O Segment Types */
var LC_REQ_DYLD = 0x80000000;
var LC_LOAD_DYLIB = 0xc;
var LC_LOAD_DYLINKER = 0xe;
var LC_SEGMENT_64 = 0x19;
var LC_MAIN = 0x28 | LC_REQ_DYLD;
var LC_UNIXTHREAD = 0x5;

/* Memory Access Rights */
var VM_PROT_NONE = 0x00;
var VM_PROT_READ = 0x01;
var VM_PROT_WRITE = 0x02;
var VM_PROT_EXECUTE = 0x04;
var VM_PROT_DEFAULT = (VM_PROT_READ|VM_PROT_WRITE|VM_PROT_EXECUTE);

/* Mach-O Cpu states */
var X86_THREAD_STATE64 = 0x4;
var X86_EXCEPTION_STATE64_COUNT = 42;

/* System Calls */
var SYSCALL_CLASS_SHIFT = 24;
var SYSCALL_CLASS_MASK = (0xFF << SYSCALL_CLASS_SHIFT);
var SYSCALL_NUMBER_MASK = (~SYSCALL_CLASS_MASK);
var SYSCALL_CLASS_UNIX = 2;
var SYSCALL_CONSTRUCT_UNIX = function(syscall_number){
	return ((SYSCALL_CLASS_UNIX << SYSCALL_CLASS_SHIFT) | (SYSCALL_NUMBER_MASK & (syscall_number)));
};

var SYS_exit = 1;
var SYS_write = 4;
