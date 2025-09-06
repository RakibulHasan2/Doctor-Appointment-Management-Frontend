import PatientLayout from '@/components/PatientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <PatientLayout>{children}</PatientLayout>;
}
