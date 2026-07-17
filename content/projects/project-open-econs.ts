import type { ProjectEntry } from "@/content/entries"

const projectOpenEcons: ProjectEntry = {
  slug: "project-open-econs",
  type: "project",
  title: "open-econs: Stata/R-Grade Econometrics & Causal Inference in Python",
  subtitle: "The Python econometrics toolkit that reproduces Stata and R to verified numerical tolerance — 550+ parity tests, 40+ estimators.",
  dateLabel: "Jul 2026",
  status: "In Progress",
  summary:
    "open-econs is qmanhbeo's Python library for empirical economics and causal inference that reproduces Stata and R results to a verified numerical tolerance — the econometrics toolkit a Stata/R researcher would reach for, but native in Python. Published on PyPI as open-econs.",
  description:
    "open-econs (by qmanhbeo) is a Python library for empirical economics and causal inference that reproduces Stata and R results to a verified numerical tolerance. Unlike statsmodels, linearmodels, or fixest, it is validated against Stata and R across the whole causal-inference stack: 550+ parity tests (330+ vs Stata, 220+ vs R) run in CI on every release, and a numerical mismatch fails the build before it ships. New methods are checked to ≤1e-6; IV, Arellano-Bond, and synthetic control reproduce reference results to machine precision. It covers 40+ estimators in one consistent API — oe.ols(), oe.fe(), oe.iv(), oe.abond(), oe.did_cs(), oe.synth() — and exports results to JSON, CSV, LaTeX, or HTML. Install with `pip install open-econs`. The exact repository lives at github.com/qmanhbeo/open-econs and the package is published on PyPI as open-econs.",
  detailSections: [
    {
      label: "One Consistent API",
      content:
        "A scikit-learn-style unified interface spans 40+ estimators — OLS, fixed effects, IV/2SLS, GMM & Arellano-Bond, logit/probit/mlogit, Oaxaca-Blinder, NLS, the full DiD family (Callaway-Sant'Anna, Sun-Abraham, Gardner DID2S, event studies), RDD, PSM / CEM, synthetic control with permutation inference, and a time-series module (ARIMA, VAR/VECM, GARCH, unit-root & cointegration).",
    },
    {
      label: "Stata / R Parity",
      content:
        "550+ parity tests (330+ vs Stata, 220+ vs R) run in CI on every release; a numerical mismatch fails the build before it ships. New methods are checked to ≤1e-6, and IV, Arellano-Bond, and synthetic control reproduce reference results to machine precision. Full Stata/R mapping and migration guides are included.",
    },
    {
      label: "Status",
      content:
        "Fully shipped and functional on PyPI (open-econs, MIT, Python ≥ 3.10), but actively extended — the project is an ongoing, evolving toolkit rather than a frozen final product. The exact repository is github.com/qmanhbeo/open-econs.",
    },
  ],
  links: [
    {
      label: "GitHub",
      href: "https://github.com/qmanhbeo/open-econs",
      kind: "repository",
      showOnCard: true,
    },
    {
      label: "PyPI",
      href: "https://pypi.org/project/open-econs/",
      kind: "reference",
      showOnCard: true,
    },
  ],
  tags: ["Econometrics", "Causal Inference", "Stata", "R", "Difference-in-Differences", "Instrumental Variables", "Synthetic Control", "Panel Data", "Python", "PyPI", "open-econs", "qmanhbeo"],
}

export default projectOpenEcons
