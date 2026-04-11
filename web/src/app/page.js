import FamilyTree from "@/components/FamilyTree";
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-[#0a0a0a]" style={{ height: '100dvh' }}>
      <PasswordGate>
        <FamilyTree />
      </PasswordGate>
    </main>
  );
}
