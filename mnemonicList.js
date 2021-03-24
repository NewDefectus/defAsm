let lines;
var mnemonicStrings = `

adcx:66)0F38F6 r r Rlq

addpd:66)0F58 r v >V Vxy

addps:0F58 r v >V Vxy

addsd:F2)0F58 r v >V Vx

addss:F3)0F58 r v >V Vx

addsubpd:66)0FD0 r v >V Vxy

addsubps:F2)0FD0 r v >V Vxy

adox:F3)0F38F6 r r Rlq

aesdec:66)0F38DE r v >V Vxy

aesdeclast:66)0F38DF r v >V Vxy

aesenc:66)0F38DC r v >V Vxy

aesenclast:66)0F38DD r v >V Vxy

aesimc:66)0F38DB r v Vx >

aeskeygenassist:66)0F3ADF r ib v Vx >

andn:0F38F2 r r >Rlq R

andpd:66)0F54 r v >V Vxy

andps:0F54 r v >V Vxy

andnpd:66)0F55 r v >V Vxy

andnps:0F55 r v >V Vxy

bextr:0F38F7 r >Rlq r R

blendpd:66)0F3A0D r ib v >V Vxy

blendps:66)0F3A0C r ib v >V Vxy

blendvpd
66)0F3815 r V_0x v V
v 66)0F3A4B r <Vxy v >V V

blendvps
66)0F3814 r V_0x v V
v 66)0F3A4A r <Vxy v >V V

blsi:0F38F3 3 r >Rlq

blsmsk:0F38F3 2 r >Rlq

blsr:0F38F3 1 r >Rlq

bndcl:F3)0F1A r rQ B

bndcn:F2)0F1B r rQ B

bndcu:F2)0F1A r rQ B

bndldx:0F1A r mQ B

bndmk:F3)0F1B r mQ B

bndmov
66)0F1A r b B
66)0F1B r B b

bndstx:0F1B r B mQ

bsf:0FBC r r Rwlq

bsr:0FBD r r Rwlq

bswap:0FC8 o Rwlq

bt
0FA3 r Rwlq r
0FBA 4 ib rwlq

btc
0FBB r Rwlq r
0FBA 7 ib rwlq

btr
0FB3 r Rwlq r
0FBA 6 ib rwlq

bts
0FAB r Rwlq r
0FBA 5 ib rwlq

bzhi:0F38F5 r Rlq r >R

call
E8 z Il
FF 2 rQ

cbw:66)98

cdq:99

cdqe:48)98

clac:0F01CA

clc:F8

cld:FC

cldemote:0F1C 0 mB

clflush:0FAE 7 mB

clflushopt:66)0FAE 7 mB

cli:FA

clrssbsy:F3)0FAE 6 mQ

clts:0F06

clwb:66)0FAE 6 mB

cmc:F5

cmppd:66)0FC2 r ib v >V Vxy

cmpps:0FC2 r ib v >V Vxy

cmps:A6 z -bwlq

cmpsd:F2)0FC2 r ib v >V Vx

cmpss:F3)0FC2 r ib v >V Vx

cmpxchg:0FB0 r Rbwlq r

cmpxchg8b:0FC7 1 mQ

cmpxchg16b:0FC7 1 m~Q

comisd:66)0F2F r v Vx >

comiss:0F2F r v Vx >

cpuid:0FA2

crc32
F2)0F38F0 r rbwl RL
F2)0F38F0 r rbq Rq

cvtdq2pd:F3)0FE6 r vX Vxy >

cvtdq2ps:0F5B r v Vxy >

cvtpd2dq:F2)0FE6 r vXy Vx >

cvtpd2pi:66)0F2D r vX VQ

cvtpd2ps:66)0F5A r vXy Vx >

cvtpi2pd:66)0F2A r vQ Vx

cvtpi2ps:0F2A r vQ Vx

cvtps2dq:66)0F5B r v Vxy >

cvtps2pd:0F5A r vX Vxy >

cvtps2pi:0F2D r vX VQ

cvtsd2si:F2)0F2D r vX Rlq >

cvtsd2ss:F2)0F5A r vX >Vx Vx

cvtsi2sd:F2)0F2A r rlq >VX VX

cvtsi2ss:F3)0F2A r rlq >VX VX

cvtss2sd:F3)0F5A r v >Vx Vx

cvtss2si:F3)0F2D r vX Rlq >

cvttpd2dq:66)0FE6 r vXy Vx >

cvttpd2pi:66)0F2C r vX VQ

cvttps2dq:F3)0F5B r v Vxy >

cvttps2pi:0F2C r vX VQ

cvttsd2si:F2)0F2C r vX Rlq >

cvtss2si:F3)0F2C r vX Rlq >

cqo:48)99

cwd:66)99

cwde:98

dec:FE 1 rbwlq

div:F6 6 rbwlq

enter:C8 z iW ib

fwait:#wait

hlt:F4

idiv:F6 7 rbwlq

imul
F6 5 rbwlq
0FAF r r Rwlq
6B r ib r Rwlq
69 r iw rw Rw
69 r il r Rlq

in
E4 z ib R_0bwl
EC z R_2W R_0bwl

inc:FE 0 rbwlq

ins:6C z -bwl

int
CC z i_3
F1 z i_1
CD z ib

int1:F1

int3:CC

iret:CF

jecxz:67)E3 z Ib

jmp
Eb z-2 Ibl
FF 4 rQ

jrcxz:E3 z Ib

lahf:9F

lea:8D r m Rwlq

leave:C9

lfs:0FB4 r m Rwlq

lgs:0FB5 r m Rwlq

lods:AC z -bwlq

loop:E2 z Ib

loope:E1 z Ib

loopne:E0 z Ib

lsl:0F03 r rW Rwlq

lss:0FB2 r m Rwlq

mov
88 r Rbwlq r
8A r r Rbwlq
8C r s Rwlq
8C r s mW
8E r Rwlq s
8E r mW s
C7 0 Il rq
B0 o8 i Rbwlq
C6 0 i rbwl
0F20 r C ^RQ
0F21 r D ^RQ
0F22 r ^RQ C
0F23 r ^RQ D

movs:A4 z -bwlq

mul:F6 4 rbwlq

neg:F6 3 rbwlq

nop
90
0F1F 0 rwL

not:F6 2 rbwlq

out
E6 z R_0bwl ib
EE z R_0bwl R_2W

outs:6E z -bwl

pop
58 o RwQ
8F 0 mwQ
0FA1 z s_4
0FA9 z s_5

popf:9D z -wQ

push
50 o RwQ
6A z-2 Ib~wl
FF 6 mwQ
0FA0 z s_4
0FA8 z s_5

pushf:9C z -wQ

ret
C3
C2 z IW

sahf:9E

sal:#shl

scas:AE z -bwlq

stc:F9

std:FD

sti:FB

stos:AA z -bwlq

syscall:0F05

test
A8 z i R_0bwlo
F6 0 i rbwlo
84 r Rbwlq r

vgatherdpd:vw 66)0F3892 r >Vxy Gx V

vgatherdps:66)0F3892 r >Vxy G V

vgatherqpd:vw 66)0F3893 r >Vxy G V

vgatherqps
66)0F3893 r >Vx G V
vl 66)0F3893 r >Vx Gy V

wait:9B

wbinvd:0F09

wbnoinvd:F3)0F09

wrfsbase:F3)0FAE 2 Rlq

wrgsbase:F3)0FAE 3 Rlq

wrmsr:0F30

wrpkru:0F01EF

wrss:0F38F6 r Rlq r

wruss:66)0F38F5 r Rlq r

xabort:C6F8 z ib

xadd:0FC0 r Rbwlq r

xbegin:C7F8 z Iwl

xchg
90 o R_0wlq R
90 o Rwlq R_0
86 r Rbwlq r
86 r r Rbwlq

xend:0F01D5

xgetbv:0F01D0

xlat:D7

xrstor:0FAE 5 mLq

xrstors:0FC7 3 mLq

xsave:0FAE 4 mLq

xsavec:0FC7 4 mLq

xsaveopt:0FAE 6 mLq

xsaves:0FC7 5 mLq

xsetbv:0F01D1

xtest:0F01D6`;
mnemonicStrings.split(/\n{2,}/).slice(1).forEach(x => { lines = x.split(/[\n:]/); mnemonics[lines.shift()] = lines; });


let hex = num => num.toString(16), dummy;

// Some extra mnemonics (these are easier to encode programatically as they're quite repetitive)
let arithmeticMnemonics = "add or adc sbb and sub xor cmp".split(' ');
arithmeticMnemonics.forEach((name, i) => {
    let opBase = i * 8;
    mnemonics[name] = [
        hex(opBase + 4) + " z i R_0bw",
        "83 " + i + " Ib rwlq",
        hex(opBase + 5) + " z il R_0l",
        "80 " + i + " i rbwl",
        hex(opBase + 5) + " z il R_0q",
        "81 " + i + " Il rq",
        hex(opBase) + " r Rbwlq r",
        hex(opBase + 2) + " r r Rbwlq",
    ];
});

// Shift mnemonics
let shiftMnemonics = `rol ror rcl rcr shl shr  sar`.split(' ');
shiftMnemonics.forEach((name, i) => {
    if(name)
        mnemonics[name] = [
            "D0 " + i + " i_1 rbwlq",
            "D2 " + i + " R_1b rbwlq",
            "C0 " + i + " ib rbwlq"
        ];
});

// Adding conditional instructions
let conditionals = `o
no
b c nae
ae nb nc
e z
ne nz
be na
a nbe
s
ns
p pe
np po
l nge
ge nl
le ng
g nle`.split('\n');
conditionals.forEach((names, i) => {
    names = names.split(' ');
    let firstName = names.shift();

    // jxx instructions
    mnemonics['j' + firstName] = [
        hex(0x70 + i) + " z Ib",
        hex(0x0F80 + i) + " z Il"
    ];

    // cmovxx instructions
    mnemonics['cmov' + firstName] = [hex(0x0F40 + i) + " r r Rwlq"];

    // Aliases
    names.forEach(name => {
        mnemonics['j' + name] = ['#j' + firstName];
        mnemonics['cmov' + name] = ['#cmov' + firstName];
    });
});