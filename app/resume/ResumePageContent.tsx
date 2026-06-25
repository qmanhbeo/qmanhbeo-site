"use client"

import { useCallback } from "react"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import type { ProjectEntry, PublicationEntry } from "@/content/entries"

const EDUCATION: { period: string; institution: string; degree: string; details?: string[]; cert?: string; certs?: string[] }[] = [
  {
    period: "Sep 2025 - Sep 2026",
    institution: "University of Birmingham",
    degree: "MSc AI and Sustainable Development",
    details: ["[Birmingham Award with Distinction.](/papers/award-birmingham.pdf)", "Working on measuring AI-for-Sustainability Research and Policy semantic gap in the embedding space for the MSc dissertation under the supervision of Dr Christian Arnold."],
  },
  {
    period: "May 2025",
    institution: "Xi'an Academy of Fine Arts",
    degree: "Summer Exchange Programme in Interactive Media Design",
    cert: "XAFA.jpg",
  },
  {
    period: "2021 - 2024",
    institution: "University of Economics Ho Chi Minh City",
    degree: "BA Applied Economics",
    details: ["Grade: 3.90/4.0 | 9.15/10 | High Distinction | Top 1%"],
    certs: ["UEH-en.png", "UEH-en-2.png"],
  },
  {
    period: "Aug 2018 - Jun 2021",
    institution: "Gia Dinh High School for the Gifted",
    degree: "Natural Sciences (Math & Physics)",
    details: ["Grade: 9.3/10"],
    cert: "H12.jpg",
  },
]

const LANGUAGES: { language: string; proficiency: string }[] = [
  { language: "Vietnamese", proficiency: "Native or bilingual proficiency" },
  { language: "English", proficiency: "Fluent" },
  { language: "Chinese", proficiency: "Elementary proficiency" },
  { language: "French", proficiency: "Elementary proficiency" },
]

const CERTIFICATIONS: { period: string; title: string; issuer: string; id?: string; cert?: string; certs?: string[] }[] = [
  { period: "Oct 2025", title: "Competency in Generative AI with Diffusion Models", issuer: "NVIDIA", id: "TauXuWfURMOBYNutOVkopw", cert: "NVIDIA-DDPM.png" },
  { period: "Jun 2024", title: "IC3 Digital Literacy Master Certification - GS6", issuer: "Certiport - A Pearson VUE Business", id: "SQar-uScD", cert: "IC3-GS6.jpg" },
  { period: "Mar 2025", title: "GRE (Q 165, V 154, W 3.5)", issuer: "ETS", id: "3343302", certs: ["GRE-1.jpg", "GRE-2.png"] },
  { period: "Nov 2024", title: "IELTS (Overall Band Score: 8.0)", issuer: "IELTS Official", id: "24VN521370NGUQ101A", cert: "IELTS.jpg" },
  { period: "Mar 2025", title: "Competency in Neural Networks and Deep Learning", issuer: "Coursera" },
]

const EXPERIENCE: { period: string; role: string; organization: string; details: string[]; cert?: string }[] = [
  {
    period: "Oct 2025 - Present",
    role: "Student Representative",
    organization: "University of Birmingham",
    details: [
      "Represent a small postgraduate cohort in the MSc AI and Sustainable Development programme.",
      "Collect and communicate student feedback to academic staff.",
      "Liaise with programme leads to bridge student perspectives with institutional action.",
    ],
  },
  {
    period: "Oct 2024 - Apr 2026",
    role: "Research Assistant",
    organization: "EEPSEA (Economy and Environment Partnership for Southeast Asia)",
    details: [
      "Contract research assistant working under Dr Truong Dang Thuy on energy poverty and energy transition.",
      "Collaborate on ongoing research in energy economics and policy analysis.",
      "Presented work at the International Conference of Economics, Law, and Governance 2025.",
    ],
    cert: "ELG2025.png",
  },
  {
    period: "Aug 2024 - Oct 2024",
    role: "Research Intern",
    organization: "EEPSEA",
    details: [],
  },
  {
    period: "Oct 2025 - Dec 2025",
    role: "PGT SHAPE AI Challenge Contributor",
    organization: "Oxford University Press",
    details: [
      "Contributed to the development and validation of an LLM evaluation benchmark for real-world language teaching and text assessment.",
      "Collaborated in a small international team on systematic content annotation and benchmark validity testing.",
      "Analysed language-teaching data and evaluation outputs to improve classification rubric design and assessment consistency.",
      "Contribution acknowledged in the [method paper](https://benchmarks.elt.edu.oup.com/).",
    ],
    cert: "PGTShapeAI.png",
  },
  {
    period: "Jul 2024",
    role: "Student Representative - Programme Accreditation",
    organization: "University of Economics Ho Chi Minh City",
    details: ["Contributed student perspectives during FIBAA standards accreditation process."],
    cert: "FIBAA.jpg",
  },
  {
    period: "Nov 2023 - Jan 2024",
    role: "Undergraduate Teaching Assistant",
    organization: "University of Economics Ho Chi Minh City",
    details: ["Graded assignments and provided feedback for a Time Series Econometrics course."],
  },
]

const RESUME_PROJECT_SUMMARIES: Record<string, string[]> = {
  "project-sdg-lens": [
    "Built a PyTorch multi-label NLP pipeline that classifies policy text into UN SDG categories with attention-based interpretability.",
  ],
  "project-paths-untold": [
    "Engineered a generative narrative engine taming non-deterministic LLM outputs through prompt engineering, regex validation, and state tracking.",
  ],
  "project-vn-real-estate-pipeline": [
    "Developed an end-to-end pipeline aggregating fragmented Vietnamese housing listings into a validated open dataset.",
    "Published on Kaggle with organic community adoption and independent external citations.",
  ],
  "project-gaia": [
    "Conceived and built an agent-based economic simulation modeling households, labor, consumption, and ecological limits as interconnected agents for RL research.",
  ],
  "project-vn-stock-rl-sandbox": [
    "Architected a modular Alpha Research Lab and RL trading framework with PPO/RecurrentPPO agents under realistic market microstructure constraints.",
  ],
  "project-uk-procurement-pipeline": [
    "Built a procurement data pipeline collecting and structuring years of UK public spending records into analysis-ready form for policy research.",
  ],
  "project-arduino-environment-robot": [
    "Built an embodied AI platform to study how learning systems behave under physical constraints versus idealized simulation.",
  ],
  "project-digital-twin": [
    "A Cohere-powered NPC inside the portfolio's pixel world that executes structured game actions from LLM responses — pathfinding, overlays, guided tours.",
  ],
  "project-gsp-replication": [
    "Rebuilt a published K-Means clustering pipeline and revealed its five-cluster result depends on the undocumented n_init=1 hyperparameter.",
  ],
}

function resumeExperienceKey(exp: { role: string; organization: string }) {
  return `${exp.role}|${exp.organization}`
}

const RESUME_EXPERIENCE_SUMMARIES: Record<string, string[]> = {
  [resumeExperienceKey({ role: "Student Representative", organization: "University of Birmingham" })]: [
    "Represent a small postgraduate cohort in the MSc AI and Sustainable Development programme, bridging student feedback to academic leads.",
  ],
  [resumeExperienceKey({ role: "Research Assistant", organization: "EEPSEA (Economy and Environment Partnership for Southeast Asia)" })]: [
    "Contract researcher under [Dr Truong Dang Thuy](https://orcid.org/0000-0002-0480-6541) on energy poverty and energy transition; presented at ELG2025.",
  ],
  [resumeExperienceKey({ role: "Research Intern", organization: "EEPSEA" })]: [
    "In a team, formalized and systematized Vietnam's yearbook data across 2 decades and 63 provinces.",
  ],
  [resumeExperienceKey({ role: "PGT SHAPE AI Challenge Contributor", organization: "Oxford University Press" })]: [
    "Developed and validated an LLM evaluation benchmark for real-world language teaching and text assessment.",
    "Contribution acknowledged in the [method paper](https://benchmarks.elt.edu.oup.com/).",
  ],
  [resumeExperienceKey({ role: "Student Representative - Programme Accreditation", organization: "University of Economics Ho Chi Minh City" })]: [
    "Contributed student perspectives during FIBAA accreditation.",
  ],
  [resumeExperienceKey({ role: "Undergraduate Teaching Assistant", organization: "University of Economics Ho Chi Minh City" })]: [
    "Graded assignments and provided feedback for a Time Series Econometrics course under [Dr Nguyen Quang](https://orcid.org/0000-0002-5955-2956).",
  ],
}

interface ResumePageContentProps {
  publications: PublicationEntry[]
  projects: ProjectEntry[]
}

export default function ResumePageContent({ publications, projects }: ResumePageContentProps) {
  const skills = [
    "vibecoding",
    "LLM & Prompt Engineering",
    "Web Scraping & Data Cleaning",
    "Data Pipeline Engineering",
    "Applied Econometrics",
    "Time Series Analysis",
    "Reinforcement Learning",
    "NLP & Text Classification",
    "PyTorch",
    "Agent-Based Modelling",
    "Simulation & RL Environments",
    "Financial Technology (FinTech)",
    "Stata, R",
    "Policy Analysis",
    "Research Design",
    "Systematic Literature Review",
    "Survey Design",
    "Solo Travelling & Farland Navigation",
  ]

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="min-h-dvh bg-white print:bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to campfire
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
          >
            <Download className="h-4 w-4" />
            Save as PDF
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-none print:shadow-none sm:p-8 md:p-10">
          {/* Header */}
          <div className="mb-6 border-b border-slate-200 pb-6 print:mb-4 print:pb-4">
            <h1 className="font-sans text-3xl font-bold tracking-tight text-slate-900 print:text-2xl">
              Nguyen Quang Manh
            </h1>
            <p className="mt-1 font-sans text-base text-slate-600">
              AI & Sustainability Researcher · Vibecoder · Whatever sparks joy
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <a href="https://www.linkedin.com/in/qmanhbeo/" className="hover:text-slate-700" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/qmanhbeo" className="hover:text-slate-700" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://qmanhbeo.vercel.app/" className="hover:text-slate-700" target="_blank" rel="noopener noreferrer">Portfolio</a>
              <span>qmanhbeo@gmail.com</span>
            </div>
          </div>

          {/* Summary */}
          <section className="mb-6 print:mb-4">
            <p className="font-sans text-sm leading-relaxed text-slate-700">
              Economics-trained AI engineer with the goal of a sustainable future where AI helps. Work follows the question, not the tool — data pipelines, NLP, RL, or whatever the problem demands.
            </p>
          </section>

          {/* Education */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Education</h2>
            {EDUCATION.map((edu, i) => (
              <div key={i} className="mb-3 print:mb-2">
                <div className="flex items-baseline justify-between">
                  {(() => {
                    if (edu.certs) {
                      return (
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); edu.certs!.forEach((f) => window.open(`/certs/${f}`, "_blank")) }}
                          className="font-sans text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                        >
                          {edu.institution}
                        </a>
                      )
                    }
                    if (edu.cert) {
                      return (
                        <a
                          href={`/certs/${edu.cert}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                        >
                          {edu.institution}
                        </a>
                      )
                    }
                    return <span className="font-sans text-sm font-semibold text-slate-900">{edu.institution}</span>
                  })()}
                  <span className="font-sans text-xs text-slate-500">{edu.period}</span>
                </div>
                <p className="font-sans text-sm text-slate-700">{edu.degree}</p>
                {edu.details && (
                  <ul className="ml-4 mt-0.5 list-disc font-sans text-xs text-slate-600">
                    {edu.details.map((d, j) => {
                      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
                      const match = linkPattern.exec(d)
                      if (match) {
                        linkPattern.lastIndex = 0
                        const before = d.slice(0, match.index)
                        const after = d.slice(match.index + match[0].length)
                        return (
                          <li key={j}>
                            {before}
                            <a href={match[2]} target={match[2].startsWith("http") ? "_blank" : undefined} rel={match[2].startsWith("http") ? "noopener noreferrer" : undefined} className="underline hover:text-slate-900">
                              {match[1]}
                            </a>
                            {after}
                          </li>
                        )
                      }
                      return <li key={j}>{d}</li>
                    })}
                  </ul>
                )}
              </div>
            ))}
          </section>

          {/* Experience */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Experience</h2>
            {EXPERIENCE.map((exp, i) => (
              <div key={i} className="mb-3 print:mb-2">
                  <div className="flex items-baseline justify-between">
                    {exp.cert ? (
                      <a
                        href={`/certs/${exp.cert}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {exp.role}
                      </a>
                    ) : (
                      <span className="font-sans text-sm font-semibold text-slate-900">{exp.role}</span>
                    )}
                    <span className="font-sans text-xs text-slate-500">{exp.period}</span>
                </div>
                <p className="font-sans text-sm text-slate-600 italic">{exp.organization}</p>
                {(RESUME_EXPERIENCE_SUMMARIES[resumeExperienceKey(exp)] ?? exp.details).length > 0 && (
                  <ul className="ml-4 mt-0.5 list-disc font-sans text-xs text-slate-600">
                    {(RESUME_EXPERIENCE_SUMMARIES[resumeExperienceKey(exp)] ?? exp.details).map((d, j) => {
                      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
                      const match = linkPattern.exec(d)
                      if (match) {
                        linkPattern.lastIndex = 0
                        const before = d.slice(0, match.index)
                        const after = d.slice(match.index + match[0].length)
                        return (
                          <li key={j}>
                            {before}
                            <a href={match[2]} target={match[2].startsWith("http") ? "_blank" : undefined} rel={match[2].startsWith("http") ? "noopener noreferrer" : undefined} className="underline hover:text-slate-900">
                              {match[1]}
                            </a>
                            {after}
                          </li>
                        )
                      }
                      return <li key={j}>{d}</li>
                    })}
                  </ul>
                )}
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Projects</h2>
            {projects.map((project) => (
              <div key={project.slug} className="mb-3 print:mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-sm font-semibold text-slate-900">{project.title}</span>
                  <span className="font-sans text-xs text-slate-500">{project.dateLabel}</span>
                </div>
                {project.subtitle && (
                  <p className="font-sans text-xs italic text-slate-500">{project.subtitle}</p>
                )}
                {(RESUME_PROJECT_SUMMARIES[project.slug] ?? project.detailSections.map((s) => s.content)).length > 0 && (
                  <ul className="ml-4 list-disc font-sans text-xs text-slate-700">
                    {(RESUME_PROJECT_SUMMARIES[project.slug] ?? project.detailSections.map((s) => s.content)).map((content, j) => (
                      <li key={j}>{content}</li>
                    ))}
                  </ul>
                )}
                {project.links.length > 0 && (
                  <div className="mt-0.5 flex gap-3">
                    {project.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs text-blue-700 hover:underline"
                      >
                        {link.kind === "repository" ? "GitHub" : link.kind === "demo" ? "Live" : link.kind === "kaggle" ? "Kaggle Dataset" : link.kind === "citation" ? "External Sample Work" : "Paper"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Publications */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Publications</h2>
            {publications.map((pub) => (
              <div key={pub.slug} className="mb-3 print:mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-sm font-semibold text-slate-900">{pub.title}</span>
                  <span className="font-sans text-xs text-slate-500">{pub.yearLabel}</span>
                </div>
                <p className="font-sans text-sm text-slate-600 italic">{pub.status ? `${pub.status} — ` : ""}{pub.journal}</p>
                <p className="font-sans text-xs text-slate-600">{pub.abstract}</p>
                {pub.links && pub.links[0] && (
                  <a href={pub.links[0].href} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-blue-700 hover:underline">
                    {pub.links[0].label}
                  </a>
                )}
              </div>
            ))}
          </section>

          {/* Skills */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 font-sans text-xs text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Licenses & Certifications</h2>
            {CERTIFICATIONS.map((cert, i) => (
              <div key={i} className="mb-2 print:mb-1">
                  <div className="flex items-baseline justify-between">
                    {(() => {
                      if (cert.certs) {
                        return (
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); cert.certs!.forEach((f) => window.open(`/certs/${f}`, "_blank")) }}
                            className="font-sans text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                          >
                            {cert.title}
                          </a>
                        )
                      }
                      if (cert.cert) {
                        return (
                          <a
                            href={`/certs/${cert.cert}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                          >
                            {cert.title}
                          </a>
                        )
                      }
                      return <span className="font-sans text-sm font-semibold text-slate-900">{cert.title}</span>
                    })()}
                  <span className="font-sans text-xs text-slate-500">{cert.period}</span>
                </div>
                <p className="font-sans text-xs text-slate-600">{cert.issuer}{cert.id ? ` - ${cert.id}` : ""}</p>
              </div>
            ))}
          </section>

          {/* Languages */}
          <section className="mb-6 print:mb-4">
            <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Languages</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {LANGUAGES.map((lang, i) => (
                <span key={i} className="font-sans text-sm text-slate-700">
                  <span className="font-semibold">{lang.language}</span> — {lang.proficiency}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
