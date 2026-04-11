import FamilyTree from "@/components/FamilyTree";
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  return (
    <main className="w-full h-full overflow-hidden bg-[#0a0a0a]">
      <PasswordGate>
        <FamilyTree />
      </PasswordGate>
    </main>
  );
}
