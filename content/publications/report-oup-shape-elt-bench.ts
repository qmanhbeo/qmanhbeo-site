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
    "The contemporary language classroom faces a dual challenge: adapting to the digital landscape while meeting diverse learners' needs. AI applications offer personalised practice and quick feedback but struggle with pedagogical competencies like empathy and adaptive guidance. This report evaluates ELT-Bench, an emerging benchmark for English Language Teaching, examining how well its structure captures the nuanced skills required in effective language teaching. By analysing how the benchmark represents real classroom practice and identifying areas for improvement, the study aims to guide responsible development and implementation of AI in language education.",
  researchQuestion:
    "How well does ELT-Bench capture the pedagogical, interpersonal, and adaptive skills required in effective language teaching, and where do its competency framework, task framing, and scoring criteria fall short?",
  methodology:
    "Cross-referenced 130 of 356 ELT-Bench tasks against their scoring criteria, rubrics, and reference answers. Six-person team collaboration through in-person meetings, shared documents, and online coordination. Consulted external research on CEFR levels, test validity, and AI safety; adopted dual perspectives as both learners and researchers to evaluate pedagogical authenticity.",
  findings:
    "Three categories of flaws identified: (1) Competency flaws — overly broad sub-competencies combining multiple learner variables, absence of strength-based feedback requirements, and performance evaluation lacking rubric grounding; (2) Framing bias — ambiguous prompts allowing multiple interpretations, information insufficiency forcing model guesswork, and culturally loaded assumptions embedded in rubrics; (3) Criteria flaws — default bias toward reference answers, inconsistent wording and emphasis across similar tasks, and incomplete treatment of key pedagogical skills.",
  implications:
    "Benchmark validity requires targeted refinements: decompose compound sub-competencies into discrete testable components, mandate holistic strength-based feedback, anchor performance evaluations in explicit rubrics with justification, align prompt design with scoring criteria, define evaluative terms operationally, and ensure consistent and complete criteria across tasks. These revisions strengthen the validity, fairness, and interpretability of ELT-Bench as a tool for responsible AI in education.",
  link: {
    label: "Read full report",
    href: "/papers/report-oup-shape-elt-bench.pdf",
    kind: "reference",
  },
  tags: ["OUP", "SHAPE AI Challenge", "ELT-Bench", "AI in Education", "Language Teaching", "Benchmark Evaluation"],
}

export default reportOupShapeEltBench
