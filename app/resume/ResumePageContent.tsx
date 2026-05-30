"use client"

import { useCallback } from "react"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import type { ArcEntry, ProjectEntry, PublicationEntry } from "@/content/entries"

const EDUCATION: { period: string; institution: string; degree: string; details?: string[]; cert?: string; certs?: string[] }[] = [
  {
    period: "Sep 2025 - Sep 2026",
    institution: "University of Birmingham",
    degree: "MSc AI and Sustainable Development",
    details: ["Birmingham Award with Distinction.", "Working on reinforcement learning for real-world resource allocation."],
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
  },
]

const LANGUAGES: { language: string; proficiency: string }[] = [
  { language: "Vietnamese", proficiency: "Native or bilingual proficiency" },
  { language: "English", proficiency: "Native or bilingual proficiency" },
  { language: "Chinese", proficiency: "Elementary proficiency" },
  { language: "French", proficiency: "Elementary proficiency" },
]

const CERTIFICATIONS: { period: string; title: string; issuer: string; id?: string }[] = [
  { period: "Oct 2025", title: "Competency in Generative AI with Diffusion Models", issuer: "NVIDIA", id: "TauXuWfURMOBYNutOVkopw" },
  { period: "Jun 2024", title: "IC3 Digital Literacy Master Certification - GS6", issuer: "Certiport - A Pearson VUE Business", id: "SQar-uScD" },
  { period: "Mar 2025", title: "GRE (Q 165, V 154, W 3.5)", issuer: "ETS", id: "3343302" },
  { period: "Nov 2024", title: "IELTS (Overall Band Score: 8.0)", issuer: "IELTS Official", id: "24VN521370NGUQ101A" },
  { period: "Mar 2025", title: "Competency in Neural Networks and Deep Learning", issuer: "Coursera" },
]

const EXPERIENCE: { period: string; role: string; organization: string; details: string[] }[] = [
  {
    period: "Oct 2025 - Present",
    role: "Student Representative",
    organization: "University of Birmingham",
    details: [
      "Represent a small postgraduate cohort in the MSc AI and Sustainable Development programme.",
      "Collect and communicate student feedback to academic staff through one-to-one discussions.",
      "Liaise with programme leads to bridge student perspectives with institutional action.",
    ],
  },
  {
    period: "Oct 2024 - Present",
    role: "Research Assistant",
    organization: "EEPSEA",
    details: [
      "Contract research assistant working under Dr Truong Dang Thuy on energy poverty and energy transition.",
      "Collaborate on ongoing research in energy economics and policy analysis.",
      "Presented work at the International Conference of Economics, Law, and Governance 2025.",
    ],
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
      "Collaborated voluntarily to improve an AI evaluation benchmark for real-world language teaching.",
      "Worked in a small international team to strengthen benchmark validity.",
      "Contribution will be acknowledged in the method paper.",
    ],
  },
  {
    period: "Jul 2024",
    role: "Student Representative - Programme Accreditation",
    organization: "University of Economics Ho Chi Minh City",
    details: ["Contributed student perspectives during FIBAA standards accreditation process."],
  },
]

function extractAwards(arcs: ArcEntry[]): { year: string; award: string }[] {
  const awards: { year: string; award: string }[] = []
  for (const arc of arcs) {
    for (const achievement of arc.whatIAchieved) {
      if (achievement.toLowerCase().includes("award") || achievement.toLowerCase().includes("prize")) {
        const yearMatch = achievement.match(/(\d{4})/)
        awards.push({ year: yearMatch?.[0] ?? arc.yearLabel, award: achievement })
      }
    }
  }
  return awards
}

function extractSkills(projects: ProjectEntry[]): string[] {
  const skillSet = new Set<string>()
  for (const project of projects) {
    for (const tag of project.tags) {
      skillSet.add(tag)
    }
  }
  return Array.from(skillSet).sort()
}

interface ResumePageContentProps {
  publications: PublicationEntry[]
  projects: ProjectEntry[]
  arcs: ArcEntry[]
}

export default function ResumePageContent({ publications, projects, arcs }: ResumePageContentProps) {
  const skills = extractSkills(projects)
  const awards = extractAwards(arcs)

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
              AI & Sustainability Researcher · Reinforcement Learning · Agent-Based Modelling
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <a href="https://www.linkedin.com/in/qmanhbeo/" className="hover:text-slate-700" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/qmanhbeo" className="hover:text-slate-700" target="_blank" rel="noopener noreferrer">GitHub</a>
              <span>qmanhbeo@gmail.com</span>
            </div>
          </div>

          {/* Summary */}
          <section className="mb-6 print:mb-4">
            <p className="font-sans text-sm leading-relaxed text-slate-700">
              My work, study, and hobbies focus on applying reinforcement learning and agent-based modelling
              to challenges in sustainability, public services, and equitable resource distribution. I work with
              data pipelines, simulations, reinforcement learning, advanced machine learning, and evaluation
              that integrate behavioural realism with algorithmic optimisation. I am motivated by advancing
              AI systems that can support fairer and more effective decision-making in the real world.
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
                    {edu.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
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
                  <span className="font-sans text-sm font-semibold text-slate-900">{exp.role}</span>
                  <span className="font-sans text-xs text-slate-500">{exp.period}</span>
                </div>
                <p className="font-sans text-sm text-slate-600 italic">{exp.organization}</p>
                {exp.details.length > 0 && (
                  <ul className="ml-4 mt-0.5 list-disc font-sans text-xs text-slate-600">
                    {exp.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
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
                <p className="font-sans text-sm text-slate-700">{project.description}</p>
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
                        {link.kind === "repository" ? "Repository" : link.kind === "demo" ? "Demo" : "Paper"}
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
                <p className="font-sans text-sm text-slate-600 italic">{pub.journal}</p>
                <p className="font-sans text-xs text-slate-600">{pub.abstract}</p>
                {pub.link && (
                  <a href={pub.link.href} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-blue-700 hover:underline">
                    {pub.link.label}
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
                  <span className="font-sans text-sm font-semibold text-slate-900">{cert.title}</span>
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

          {/* Awards */}
          {awards.length > 0 && (
            <section className="print:mb-4">
              <h2 className="mb-3 font-sans text-base font-bold uppercase tracking-wider text-slate-800 print:mb-2">Honors & Awards</h2>
              {awards.map((award, i) => (
                <div key={i} className="mb-2 flex items-baseline justify-between print:mb-1">
                  <span className="font-sans text-sm text-slate-700">{award.award}</span>
                  <span className="font-sans text-xs text-slate-500">{award.year}</span>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
