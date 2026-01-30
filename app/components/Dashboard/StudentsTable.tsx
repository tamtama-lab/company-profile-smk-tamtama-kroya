import dayjs from "dayjs";

export interface Student {
  id: number;
  nisn: string;
  nik: string;
  fullName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  schoolOriginName: string;
  schoolOriginNpsn: string | null;
  address: string;
  phoneNumber: string;
  email: string;
  isKipRecipient: number;
  registrationId: number;
  updatedAt: string;
}

interface StudentsTableProps {
  students: Student[];
  isLoading?: boolean;
}

export function StudentsTable({ students, isLoading }: StudentsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500">Belum ada data siswa terdaftar</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD MMMM YYYY HH:mm");
  };

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-200 bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Nama Murid
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                No. Pendaftaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Waktu Pendaftaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Alamat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Asal SMP/MTs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {student.fullName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.registrationId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(student.updatedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.address}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {student.schoolOriginName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
