import type { PublicationEntry } from "@/content/entries"

const reportOupShapeEltBench: PublicationEntry = {
  slug: "report-oup-shape-elt-bench",
  type: "publication",
  order: 3,
  title: "SHAPE 8I: Bridging Benchmarks and Classrooms Through a Human-Centric Review of ELT-Bench",
  subtitle: "A critical evaluation of AI benchmarks for English language teaching",
  journal: "OUP SHAPE AI Challenge",
  yearLabel: "2025",
  status: "Challenge Report",
  summary:
    "A human-centric evaluation of ELT-Bench — identifying competency flaws, framing biases, and criteria inconsistencies that limit how well AI benchmarks reflect real classroom language teaching.",
  abstract:
    "Identifies competency flaws, framing biases, and criteria inconsistencies in ELT-Bench that limit how well AI benchmarks reflect real classroom language teaching.",
  researchQuestion:
    "How well does ELT-Bench capture real classroom practice, and where do its competency framework, framing, and scoring criteria fall short?",
  methodology:
    "Six-person team cross-referenced 130 ELT-Bench tasks against scoring criteria, drawing on CEFR expertise and dual learner/researcher perspectives.",
  findings:
    "Three flaw categories: overly broad competencies, culturally loaded framing, and inconsistent scoring criteria — the benchmark's validity is weakened in all three areas.",
  implications:
    "Refine benchmarks by decomposing competencies, adding strength-based feedback, requiring explicit rubrics, and aligning prompts with criteria.",
  link: {
    label: "Read full report",
    href: "/papers/report-oup-shape-elt-bench.pdf",
    kind: "reference",
  },
  tags: ["OUP", "SHAPE AI Challenge", "ELT-Bench", "AI in Education", "Language Teaching", "Benchmark Evaluation"],
}

export default reportOupShapeEltBench
