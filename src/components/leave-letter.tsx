'use client';
import type { LeaveRequest, User, Department, LeaveType } from '@/types';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import Image from 'next/image';
import { settings } from '@/lib/data-supabase';

interface LeaveLetterProps {
    request: LeaveRequest;
    user: User;
    department: Department;
    leaveType?: LeaveType;
    letterNumber: string;
    approver?: User;
    headOfAgency?: User;
}

const styles = {
  table: "w-full border-collapse border border-black",
  cell: "border border-black p-1",
  cellHeader: "border border-black p-1 font-bold text-center",
  cellCenter: "border border-black p-1 text-center",
  outerBorder: "border-2 border-black",
};


const PrintHeaderContent = () => (
    <header className="mb-2 border-b-2 border-black pb-2">
        <div className="flex flex-row items-center justify-start gap-4 pl-16">
            {settings.logoUrl && <Image src={settings.logoUrl} alt="Logo" width={80} height={80} className="object-contain" />}
            <div className="leading-tight text-center">
                <h1 className="font-bold text-[18px]" style={{ wordSpacing: '0.1em' }}>{settings.letterhead[0]}</h1>
                <h2 className="font-bold text-[18px]" style={{ wordSpacing: '0.1em' }}>{settings.letterhead[1]}</h2>
                <h3 className="font-bold text-[18px]" style={{ wordSpacing: '0.1em' }}>{settings.letterhead[2]}</h3>
                <h3 className="font-bold text-[18px]" style={{ wordSpacing: '0.1em' }}>{settings.letterhead[3]}</h3>
                <p className="text-sm">{settings.letterhead[4]}</p>
                <p className="text-sm">{settings.letterhead[5]}</p>
            </div>
        </div>
    </header>
);

const SignatureBlock = ({ user, title, signatureDate }: { user?: User, title?: string, signatureDate?: Date }) => {
    if (!user) return <div className="h-full"></div>;
    const dateToDisplay = signatureDate ? format(signatureDate, 'dd-MM-yyyy') : '...................';

    return (
        <div className="text-center h-full flex flex-col justify-between p-1">
            <div>
                <p className="mb-1">{title || dateToDisplay}</p>
            </div>
            <div className="h-16 w-16 mx-auto my-1 flex items-center justify-center">
                {user.qrCodeSignature ? (
                    <Image src={user.qrCodeSignature} alt="QR Code" width={64} height={64} className="mx-auto object-contain" />
                ) : (
                    <div className="h-16"></div>
                )}
            </div>
            <div>
                <p className="underline font-bold mt-1">{user.name}</p>
                <p>NIP. {user.nip}</p>
            </div>
        </div>
    );
};


export function LeaveLetter({ request, user, department, leaveType, letterNumber, approver, headOfAgency }: LeaveLetterProps) {
    
    const duration = request.days;
    const leaveTypeCheck = (type: string) => leaveType?.name === type ? '✓' : '';
    const currentYear = new Date().getFullYear();
    
    const calculateMasaKerja = (joinDate?: Date): string => {
        if (!joinDate) return '.......................';
        const now = new Date();
        const years = differenceInYears(now, joinDate);
        const months = differenceInMonths(now, joinDate) % 12;
        if (years > 0) {
            return `${years} tahun, ${months} bulan`;
        }
        return `${months} bulan`;
    }

    const leaveBalanceBefore = (request.status === 'Approved' || request.status === 'Pending') && leaveType?.name === 'Cuti Tahunan'
        ? user.annualLeaveBalance + request.days
        : user.annualLeaveBalance;
    
    const leaveBalanceAfter = leaveType?.name === 'Cuti Tahunan' ? user.annualLeaveBalance : '-';


    return (
        <div className="bg-white p-4 font-body text-xs" id="print-area">
            <style jsx global>{`
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .section-container {
                    break-inside: avoid;
                    page-break-inside: avoid;
                  }
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                <PrintHeaderContent />
                
                <h4 className="font-bold text-center underline mb-1 mt-2">FORMULIR PERMINTAAN DAN PEMBERIAN CUTI</h4>
                <p className="text-center mb-2">Nomor: {letterNumber}</p>

                <div className={`${styles.outerBorder} mt-1`}>
                    {/* SECTION I */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">I. DATA PEGAWAI</p>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td className={styles.cell} style={{width: '15%'}}>Nama</td>
                                    <td className={styles.cell} style={{width: '55%'}}>{user.name}</td>
                                    <td className={styles.cell} style={{width: '10%'}}>NIP</td>
                                    <td className={styles.cell} style={{width: '20%'}}>{user.nip}</td>
                                </tr>
                                <tr>
                                    <td className={styles.cell}>Jabatan</td>
                                    <td className={styles.cell}>{user.role === 'Admin' ? 'Admin' : 'Pegawai'}</td>
                                    <td className={styles.cell}>Masa Kerja</td>
                                    <td className={styles.cell}>{calculateMasaKerja(user.joinDate)}</td>
                                </tr>
                                <tr>
                                    <td className={styles.cell}>Unit Kerja</td>
                                    <td className={styles.cell} colSpan={3}>{department.name}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* SECTION II */}
                     <div className="section-container mt-1">
                        <p className="font-bold pl-1">II. JENIS CUTI YANG DIAMBIL **</p>
                         <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td className={`${styles.cell} w-1/3`}>1. Cuti Tahunan <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti Tahunan')}</span></td>
                                    <td className={`${styles.cell} w-1/3`}>2. Cuti Besar <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti Besar')}</span></td>
                                    <td className={`${styles.cell} w-1/3`}>3. Cuti Sakit <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti Sakit')}</span></td>
                                </tr>
                                 <tr>
                                    <td className={styles.cell}>4. Cuti Melahirkan <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti Melahirkan')}</span></td>
                                    <td className={styles.cell}>5. Cuti Karena Alasan Penting <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti Alasan Penting')}</span></td>
                                    <td className={styles.cell}>6. Cuti di Luar Tanggungan Negara <span className="float-right font-bold text-lg pr-2">{leaveTypeCheck('Cuti di Luar Tanggungan Negara')}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SECTION III */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">III. ALASAN CUTI</p>
                        <div className={`${styles.cell} min-h-[2rem]`}>{request.reason}</div>
                    </div>

                    {/* SECTION IV */}
                     <div className="section-container mt-1">
                        <p className="font-bold pl-1">IV. LAMANYA CUTI</p>
                        <table className={styles.table}>
                             <tbody>
                                <tr>
                                    <td className={styles.cell} style={{width: '10%'}}>Selama</td>
                                    <td className={styles.cell} style={{width: '30%'}}>{duration} (hari)*</td>
                                    <td className={styles.cell} style={{width: '15%'}}>mulai tanggal</td>
                                    <td className={styles.cell} style={{width: '20%'}}>{format(request.startDate, 'dd-MM-yyyy')}</td>
                                    <td className={styles.cell} style={{width: '5%'}}>s/d</td>
                                    <td className={styles.cell} style={{width: '20%'}}>{format(request.endDate, 'dd-MM-yyyy')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* SECTION V */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">V. CATATAN CUTI ***</p>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    {/* Kolom Kiri - Cuti Tahunan */}
                                    <td className={`${styles.cell} align-top p-0`} style={{width: '50%'}}>
                                        <table className="w-full h-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th colSpan={3} className="font-bold text-left p-1 border-b border-black">1. CUTI TAHUNAN</th>
                                                </tr>
                                                <tr>
                                                    <td className={styles.cellHeader} style={{width: '25%'}}>Tahun</td>
                                                    <td className={styles.cellHeader} style={{width: '25%'}}>Sisa</td>
                                                    <td className={styles.cellHeader} style={{width: '50%'}}>Keterangan</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className={styles.cellCenter}>{currentYear - 2}</td>
                                                    <td className={styles.cellCenter}>-</td>
                                                    <td className={styles.cell}></td>
                                                </tr>
                                                <tr>
                                                    <td className={styles.cellCenter}>{currentYear - 1}</td>
                                                    <td className={styles.cellCenter}>-</td>
                                                    <td className={styles.cell}></td>
                                                </tr>
                                                <tr>
                                                    <td className={styles.cellCenter}>{currentYear}</td>
                                                    <td className={styles.cellCenter}>{user.annualLeaveBalance}</td>
                                                    <td className={styles.cell}></td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={3} className={`${styles.cell} text-center font-bold border-t-0`}>
                                                        Paraf Petugas Cuti: ✓
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </td>
                                    {/* Kolom Kanan - Jenis Cuti Lainnya */}
                                    <td className={`${styles.cell} align-top p-0`} style={{width: '50%'}}>
                                         <table className="w-full h-full border-collapse">
                                            <tbody>
                                                <tr>
                                                    <td className={`${styles.cell} border-t-0 border-l-0`}>2. Cuti Besar</td>
                                                    <td className={`${styles.cell} border-t-0 border-r-0 w-1/4`}></td>
                                                </tr>
                                                 <tr>
                                                    <td className={`${styles.cell} border-l-0`}>3. Cuti Sakit</td>
                                                    <td className={`${styles.cell} border-r-0`}></td>
                                                </tr>
                                                <tr>
                                                    <td className={`${styles.cell} border-l-0`}>4. Cuti Melahirkan</td>
                                                    <td className={`${styles.cell} border-r-0`}></td>
                                                </tr>
                                                <tr>
                                                    <td className={`${styles.cell} border-l-0`}>5. Cuti Karena Alasan Penting</td>
                                                    <td className={`${styles.cell} border-r-0`}></td>
                                                </tr>
                                                 <tr>
                                                    <td className={`${styles.cell} border-b-0 border-l-0`}>6. Cuti di Luar Tanggungan Negara</td>
                                                    <td className={`${styles.cell} border-b-0 border-r-0`}></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    
                    {/* SECTION VI */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">VI. ALAMAT SELAMA MENJALANKAN CUTI</p>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td className={`${styles.cell} w-2/3 align-top`} style={{height: '140px'}}>
                                        <div className="min-h-[50px]">{user.address || '..................................'}</div>
                                        {leaveType?.name === 'Cuti Tahunan' && (
                                        <div className="text-xs mt-2">
                                            <p className="font-bold">Catatan Kepegawaian:</p>
                                            <p>
                                            Sisa cuti ybs. adalah {leaveBalanceBefore} hari, apabila
                                            diambil {request.days} hari, maka sisa cuti ybs.
                                            tersisa {leaveBalanceAfter} hari
                                            </p>
                                        </div>
                                        )}
                                    </td>
                                    <td className={`${styles.cell} w-1/3 align-top text-center`}>
                                        <SignatureBlock user={user} title="Hormat saya," />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    
                    {/* SECTION VII */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">VII. PERTIMBANGAN ATASAN LANGSUNG **</p>
                        <table className={styles.table}>
                           <tbody>
                                <tr>
                                    <td className={styles.cellCenter}>DISETUJUI</td>
                                    <td className={styles.cellCenter}>PERUBAHAN****</td>
                                    <td className={styles.cellCenter}>DITANGGUHKAN****</td>
                                    <td className={styles.cellCenter}>TIDAK DISETUJUI****</td>
                                </tr>
                                <tr style={{ height: '2rem' }}>
                                    <td className={styles.cellCenter}>
                                        <span className='font-bold text-lg'>{request.status === 'Approved' ? '✓' : ''}</span>
                                    </td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}>
                                        <span className='font-bold text-lg'>{request.status === 'Suspended' ? '✓' : ''}</span>
                                    </td>
                                    <td className={styles.cellCenter}>
                                        <span className='font-bold text-lg'>{request.status === 'Rejected' ? '✓' : ''}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={`${styles.cell} p-0 w-2/3`} colSpan={3}></td>
                                    <td className={`${styles.cell} text-center align-top p-0 w-1/3`} style={{ height: '140px' }}>
                                        {approver && <SignatureBlock user={approver} signatureDate={request.createdAt} />}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>


                    {/* SECTION VIII */}
                    <div className="section-container mt-1">
                        <p className="font-bold pl-1">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI **</p>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td className={styles.cellCenter}>DISETUJUI</td>
                                    <td className={styles.cellCenter}>PERUBAHAN****</td>
                                    <td className={styles.cellCenter}>DITANGGUHKAN****</td>
                                    <td className={styles.cellCenter}>TIDAK DISETUJUI****</td>
                                </tr>
                                <tr style={{ height: '2rem' }}>
                                    <td className={styles.cellCenter}>
                                        <span className='font-bold text-lg'>{request.status === 'Approved' ? '✓' : ''}</span>
                                    </td>
                                    <td className={styles.cellCenter}></td>
                                    <td className={styles.cellCenter}>
                                        <span className='font-bold text-lg'>{request.status === 'Suspended' ? '✓' : ''}</span>
                                    </td>
                                    <td className={styles.cellCenter}>
                                         <span className='font-bold text-lg'>{request.status === 'Rejected' ? '✓' : ''}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={`${styles.cell} p-0 w-2/3`} colSpan={3}></td>
                                    <td className={`${styles.cell} text-center align-top p-0 w-1/3`} style={{ height: '140px' }}>
                                         {headOfAgency && <SignatureBlock user={headOfAgency} signatureDate={request.createdAt} />}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                         <div className="pl-1 text-xs mt-1">
                           <p>CATATAN:</p>
                           <p>* Coret yang tidak perlu</p>
                           <p>** Pilih salah satu dengan memberi tanda centang (✓)</p>
                           <p>*** diisi oleh pejabat yang menangani bidang kepegawaian sebelum surat permohonan cuti diserahkan kepada pejabat yang berwenang memberikan cuti</p>
                           <p>**** diberi tanda centang dan alasannya</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // extends React's HTMLAttributes
      'data-value'?: string;
    }
}

    
    