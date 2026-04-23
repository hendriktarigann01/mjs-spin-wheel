import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const prizes = [
  {
    name: "KEY CHAIN",
    image: "/prize/keychain.png",
    weight: 65,
    stock: 65,
    color: "#25569E",
  },
  {
    name: "NOTEBOOK",
    image: "/prize/notebook.png",
    weight: 20,
    stock: 20,
    color: "#0D1F3C",
  },
  {
    name: "MUG",
    image: "/prize/mug.png",
    weight: 16,
    stock: 16,
    color: "#25569E",
  },
  {
    name: "HAND FAN",
    image: "/prize/fan.png",
    weight: 46,
    stock: 46,
    color: "#0D1F3C",
  },
  {
    name: "PEN",
    image: "/prize/pen.png",
    weight: 50,
    stock: 50,
    color: "#25569E",
  },
];

async function main() {
  const { error: delError } = await supabase
    .from("prizes")
    .delete()
    .gte("id", 1);
  if (delError) {
    console.error("Delete failed:", delError);
    process.exit(1);
  }

  const { data, error } = await supabase.from("prizes").insert(prizes).select();
  if (error) {
    console.error("Insert failed:", error);
    process.exit(1);
  }

  console.log("Seeded:", data);
}

main().catch(console.error);
