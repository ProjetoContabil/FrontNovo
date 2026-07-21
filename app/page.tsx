"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building,
  Camera,
  FileKey,
  Shield,
  ShieldCheck,
  Search,
  Upload,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileCheck,
  Bell,
  Save,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  BarChart3,
  Home,
  User,
  UserCircle,
  Settings,
  Pencil,
  Layers,
  Lock,
  Unlock,
  HelpCircle,
  Info,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  ArrowUpRight,
  Trash2,
  LockKeyhole,
  Plus,
  Receipt,
  LayoutDashboard,
  Users,
  Copy,
  AlertTriangle,
  Calculator,
  Sparkles,
  Globe,
  CheckCircle2,
  Send,
  Download,
  Share2,

  Landmark
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// Helper function to mathematically validate CNPJ (Cadastro Nacional da Pessoa Jurídica)
const isValidCnpj = (cnpjValue: string): boolean => {
  const clean = cnpjValue.replace(/\D/g, "");
  if (clean.length !== 14) return false;

  // Accept predefined mocks in mock database
  const whitelistedMocks = [
    "12345678000190",
    "45987654000132",
    "78123456000121",
    "66378843000134",
    "22333444000155",
    "55666777000188",
    "88999000000111",
    "11222333000144"
  ];
  if (whitelistedMocks.includes(clean)) return true;

  // Reject known invalid sequential or repeated patterns (e.g. 11111111111111)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validate first check digit
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Validate second check digit
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

// Helper function to highlight search term in standard texts
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query) return text;
  
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  try {
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-[2px] shadow-xs">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (e) {
    return text;
  }
};

// Helper function to highlight CNPJ intelligently (handles formatting and raw digits)
const highlightCnpj = (cnpj: string, query: string): React.ReactNode => {
  if (!query) return cnpj;
  
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  if (cnpj.toLowerCase().includes(query.toLowerCase())) {
    try {
      const parts = cnpj.split(new RegExp(`(${escapedQuery})`, "gi"));
      return (
        <>
          {parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() ? (
              <mark key={i} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-[2px] shadow-xs">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch {
      return cnpj;
    }
  }

  const cleanQuery = query.replace(/\D/g, "");
  if (!cleanQuery) return cnpj;

  const cleanCnpj = cnpj.replace(/\D/g, "");
  const matchIndex = cleanCnpj.indexOf(cleanQuery);
  
  if (matchIndex === -1) return cnpj;

  const result: React.ReactNode[] = [];
  let digitCounter = 0;
  const matchEnd = matchIndex + cleanQuery.length;

  for (let i = 0; i < cnpj.length; i++) {
    const char = cnpj[i];
    if (/\d/.test(char)) {
      if (digitCounter >= matchIndex && digitCounter < matchEnd) {
        result.push(
          <mark key={i} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-[2px] shadow-xs">
            {char}
          </mark>
        );
      } else {
        result.push(char);
      }
      digitCounter++;
    } else {
      if (digitCounter > matchIndex && digitCounter < matchEnd) {
        result.push(
          <mark key={i} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-[2px] shadow-xs">
            {char}
          </mark>
        );
      } else {
        result.push(char);
      }
    }
  }

  return <>{result}</>;
};

// Mock Database for CNPJ Simulation
const mockCnpjData: Record<string, any> = {
  "66.378.843/0001-34": {
    razaoSocial: "LACUNAS LTDA",
    nomeFantasia: "Lacunas Fiscal Solutions",
    cep: "30140-061",
    logradouro: "Avenida João Pinheiro",
    bairro: "Centro",
    municipio: "Belo Horizonte",
    uf: "MG",
    email: "financeiro@lacunas.com.br",
    telefone: "(31) 98765-4321",
    regimeTributario: "Simples Nacional",
    cnaePrincipal: "62.01-5/01 - Desenvolvimento de programas de computador sob encomenda",
    cnaesSecundarios: "62.02-3/00 - Consultoria em tecnologia da informação\n62.03-1/00 - Desenvolvimento e licenciamento de programas de computador customizáveis",
    municipioIncidencia: "Belo Horizonte - MG",
  },
  "12.345.678/0001-90": {
    razaoSocial: "ALPHA EMPREENDIMENTOS DIGITAIS S/A",
    nomeFantasia: "Alpha Tech",
    cep: "01311-200",
    logradouro: "Avenida Paulista",
    bairro: "Bela Vista",
    municipio: "São Paulo",
    uf: "SP",
    email: "contato@alphadigital.com.br",
    telefone: "(11) 99876-5432",
    regimeTributario: "Lucro Presumido",
    cnaePrincipal: "62.04-0/00 - Consultoria em tecnologia da informação",
    cnaesSecundarios: "73.19-0/03 - Marketing direto",
    municipioIncidencia: "São Paulo - SP",
  }
};

// Mock Database for CEP Simulation
const mockCepData: Record<string, any> = {
  "30140-061": { logradouro: "Avenida João Pinheiro", bairro: "Centro", municipio: "Belo Horizonte", uf: "MG" },
  "01311-200": { logradouro: "Avenida Paulista", bairro: "Bela Vista", municipio: "São Paulo", uf: "SP" },
  "20040-002": { logradouro: "Avenida Rio Branco", bairro: "Centro", municipio: "Rio de Janeiro", uf: "RJ" },
  "70040-010": { logradouro: "Esplanada dos Ministérios", bairro: "Zona Cívico-Administrativa", municipio: "Brasília", uf: "DF" }
};

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface Company {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  regimeTributario: string;
  uf: string;
  municipio: string;
  statusAcesso: "Não Configurado" | "e-CNPJ Ativo" | "Procuração Ativa";
  statusPgdas: "Entregue" | "Pendente" | "Processando" | "Sem Movimento";
  periodoApuracao: string;
  statusEmpresa?: "Ativa" | "Inativa" | "Suspensa" | "Excluída";
  logoUrl?: string | null;
  tratamentoTributarioGlobal?: string;
}

// Framer Motion Variants for Staggered Lists
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      mass: 0.8
    }
  },
} as const;

export default function Page() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<"dashboard" | "empresas" | "detalhes_empresa" | "cadastro_empresa" | "certificados" | "procuracoes" | "relatorios" | "configuracoes" | "perfil_escritorio" | "pgdas">("dashboard");
  const [isFiscalMenuOpen, setIsFiscalMenuOpen] = useState(false);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"dados" | "responsaveis" | "equipe" | "preferencias">("dados");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<"admin" | "escritorio">("escritorio");
  const [profileGroupOpen, setProfileGroupOpen] = useState(true);

  // Companies & Search/Filters States
  const [companies, setCompanies] = useState<Company[]>([
    {
      cnpj: "66.378.843/0001-34",
      razaoSocial: "LACUNAS LTDA",
      nomeFantasia: "Lacunas Fiscal Solutions",
      regimeTributario: "Simples Nacional",
      uf: "MG",
      municipio: "Belo Horizonte",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "12.345.678/0001-90",
      razaoSocial: "ALPHA EMPREENDIMENTOS DIGITAIS S/A",
      nomeFantasia: "Alpha Tech",
      regimeTributario: "Lucro Presumido",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "e-CNPJ Ativo",
      statusPgdas: "Entregue",
      periodoApuracao: "Maio/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "45.987.654/0001-32",
      razaoSocial: "BETA CONSULTORIA E SERVIÇOS LTDA",
      nomeFantasia: "Beta Services",
      regimeTributario: "Simples Nacional",
      uf: "RJ",
      municipio: "Rio de Janeiro",
      statusAcesso: "Procuração Ativa",
      statusPgdas: "Entregue",
      periodoApuracao: "Maio/2026",
      statusEmpresa: "Inativa"
    },
    {
      cnpj: "78.123.456/0001-21",
      razaoSocial: "OMEGA COMÉRCIO MULTIVAREJO EIRELI",
      nomeFantasia: "Omega Market",
      regimeTributario: "Simples Nacional",
      uf: "PR",
      municipio: "Curitiba",
      statusAcesso: "Não Configurado",
      statusPgdas: "Processando",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Suspensa"
    },
    {
      cnpj: "22.333.444/0001-55",
      razaoSocial: "GAMA DISTRIBUIDORA DE ALIMENTOS LTDA",
      nomeFantasia: "Gama Food",
      regimeTributario: "Simples Nacional",
      uf: "SC",
      municipio: "Florianópolis",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-01",
      razaoSocial: "COMPANY A",
      nomeFantasia: "Company A",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-02",
      razaoSocial: "COMPANY B",
      nomeFantasia: "Company B",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-03",
      razaoSocial: "COMPANY C",
      nomeFantasia: "Company C",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-04",
      razaoSocial: "COMPANY D",
      nomeFantasia: "Company D",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-05",
      razaoSocial: "COMPANY E",
      nomeFantasia: "Company E",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-06",
      razaoSocial: "COMPANY F",
      nomeFantasia: "Company F",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-07",
      razaoSocial: "COMPANY G",
      nomeFantasia: "Company G",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-08",
      razaoSocial: "COMPANY H",
      nomeFantasia: "Company H",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-09",
      razaoSocial: "COMPANY I",
      nomeFantasia: "Company I",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-10",
      razaoSocial: "COMPANY J",
      nomeFantasia: "Company J",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-11",
      razaoSocial: "COMPANY K",
      nomeFantasia: "Company K",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-12",
      razaoSocial: "COMPANY L",
      nomeFantasia: "Company L",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-13",
      razaoSocial: "COMPANY M",
      nomeFantasia: "Company M",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-14",
      razaoSocial: "COMPANY N",
      nomeFantasia: "Company N",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-15",
      razaoSocial: "COMPANY O",
      nomeFantasia: "Company O",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-16",
      razaoSocial: "COMPANY P",
      nomeFantasia: "Company P",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-17",
      razaoSocial: "COMPANY Q",
      nomeFantasia: "Company Q",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-18",
      razaoSocial: "COMPANY R",
      nomeFantasia: "Company R",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "10.000.000/0001-19",
      razaoSocial: "COMPANY S",
      nomeFantasia: "Company S",
      regimeTributario: "Simples Nacional",
      uf: "SP",
      municipio: "São Paulo",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "55.666.777/0001-88",
      razaoSocial: "DELTA TECNOLOGIA E SISTEMAS S/A",
      nomeFantasia: "Delta Tech",
      regimeTributario: "Lucro Presumido",
      uf: "RS",
      municipio: "Porto Alegre",
      statusAcesso: "e-CNPJ Ativo",
      statusPgdas: "Entregue",
      periodoApuracao: "Maio/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "88.999.000/0001-11",
      razaoSocial: "EPSILON CONSTRUTORA E INCORPORADORA EIRELI",
      nomeFantasia: "Epsilon Engenharia",
      regimeTributario: "Lucro Presumido",
      uf: "GO",
      municipio: "Goiânia",
      statusAcesso: "Procuração Ativa",
      statusPgdas: "Sem Movimento",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Ativa"
    },
    {
      cnpj: "11.222.333/0001-44",
      razaoSocial: "SIGMA SERVIÇOS LOGÍSTICOS S/S",
      nomeFantasia: "Sigma Log",
      regimeTributario: "Simples Nacional",
      uf: "PE",
      municipio: "Recife",
      statusAcesso: "Não Configurado",
      statusPgdas: "Pendente",
      periodoApuracao: "Junho/2026",
      statusEmpresa: "Inativa"
    }
  ]);

  const [selectedCompanyCnpj, setSelectedCompanyCnpj] = useState<string>("66.378.843/0001-34");
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [filterRegime, setFilterRegime] = useState("all");
  const [filterAcesso, setFilterAcesso] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPgdas, setFilterPgdas] = useState("all");

  // Pagination states for companies list
  const [companiesPage, setCompaniesPage] = useState(1);
  const [companiesPerPage, setCompaniesPerPage] = useState(5);
  const [showNextStep, setShowNextStep] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Trigger loading skeleton on companies search/filters/page changes
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoadingCompanies(true);
    }, 0);
    
    const resolveTimer = setTimeout(() => {
      setIsLoadingCompanies(false);
    }, 500);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(resolveTimer);
    };
  }, [searchTerm, filterRegime, filterAcesso, filterStatus, filterPgdas, companiesPage]);

  // User notifications / toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounterRef = useRef(0);
  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    toastCounterRef.current += 1;
    const id = toastCounterRef.current.toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ==========================================
  // STATE: CADASTRO DE EMPRESA
  // ==========================================
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [status, setStatus] = useState<"Ativa" | "Inativa" | "Suspensa" | "Excluída">("Ativa");
  const [dataAbertura, setDataAbertura] = useState("");
  const [dataBaixa, setDataBaixa] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("Belo Horizonte");
  const [uf, setUf] = useState("MG");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regimeTributario, setRegimeTributario] = useState("Simples Nacional");
  const [tratamentoTributarioGlobal, setTratamentoTributarioGlobal] = useState("AUTOMATICO SISTEMA");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [cnaePrincipal, setCnaePrincipal] = useState("");
  const [cnaeSecundarios, setCnaeSecundarios] = useState("");
  const [municipioIncidencia, setMunicipioIncidencia] = useState("");
  const [observacoesFiscais, setObservacoesFiscais] = useState("");
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // ==========================================
  // STATE: PGDAS-D APURAÇÃO (REWRITTEN MODULO FISCAL)
  // ==========================================
  const [pgdasStep, setPgdasStep] = useState<1 | 2 | 3>(1);
  const [pgdasEmpresaCnpj, setPgdasEmpresaCnpj] = useState("53.855.322/0001-95");
  const [pgdasEmpresaName, setPgdasEmpresaName] = useState("NAIALE AUGUSTINHO CONTABILIDADE LTDA");
  const [pgdasCompetencia, setPgdasCompetencia] = useState("2026-06");
  const [pgdasApuracaoModo, setPgdasApuracaoModo] = useState("APURAÇÃO REAL");
  
  // Página 1 States
  const [pgdasHistorico, setPgdasHistorico] = useState({
    rbt12: 1580000.00,
    folha: 490000.00,
    fatorR: 31.01,
    resultado: "Anexo III",
    competenciasEncontradas: 12,
    folhaCompleta: true,
    ajusteManual: true
  });
  const [pgdasImportSummary, setPgdasImportSummary] = useState({
    importados: 248,
    aceitos: 239,
    duplicados: 4,
    cancelados: 3,
    rejeitados: 2
  });
  const [pgdasDocs, setPgdasDocs] = useState([
    { id: "1", data: "03/06/26", doc: "NF-e 001245", tipo: "Venda", valor: 5200.00, origem: "XML", situacao: "✓ Aceito" },
    { id: "2", data: "05/06/26", doc: "NFS-e 000088", tipo: "Serviço", valor: 3800.00, origem: "XML", situacao: "⚠ Revisar" },
    { id: "3", data: "08/06/26", doc: "NF-e 001252", tipo: "Venda", valor: 7100.00, origem: "XML", situacao: "✓ Aceito" },
    { id: "4", data: "10/06/26", doc: "NFS-e 000091", tipo: "Serviço", valor: 2400.00, origem: "XML", situacao: "✕ Erro" },
  ]);
  const [showDocCorrection, setShowDocCorrection] = useState(false);
  const [correctingDoc, setCorrectingDoc] = useState<any>(null);

  // Página 2 States
  const [pgdasClassificacoes, setPgdasClassificacoes] = useState([
    { id: "c1", atividade: "Consultoria", evidencia: "LC 116 17.01", receita: 82000.00, tratamento: "Anexo III", status: "✓ OK" },
    { id: "c2", atividade: "Software", evidencia: "cTribNac", receita: 54500.00, tratamento: "Fator R/Anexo III", status: "✓ OK" },
    { id: "c3", atividade: "Licenciamento", evidencia: "CNAE apenas", receita: 29700.00, tratamento: "Não definido", status: "⚠ Ver" },
    { id: "c4", atividade: "Mercadoria mono.", evidencia: "NCM/CFOP", receita: 8300.00, tratamento: "Monofásico", status: "✓ OK" },
    { id: "c5", atividade: "Comércio normal", evidencia: "NCM/CFOP", receita: 10000.00, tratamento: "Anexo I", status: "✓ OK" },
  ]);
  const [pgdasPreviewInterna, setPgdasPreviewInterna] = useState({
    receitaTotal: 184500.00,
    receitaTributavel: 176200.00,
    aliquotaEfetiva: 4.78,
    dasCalculado: 8420.36,
    detalhes: {
      irpj: 920.48, csll: 710.15, cofins: 690.63, pis: 149.75, cpp: 3165.40, iss: 2170.25, outros: 613.70
    }
  });
  const [pgdasPreviewOficial, setPgdasPreviewOficial] = useState<any>(null);
  const [isValidatingOficial, setIsValidatingOficial] = useState(false);

  // Página 3 States
  const [pgdasTransmissionState, setPgdasTransmissionState] = useState<"pronta" | "processando" | "incerto" | "transmitida" | "concluida">("pronta");
  const [transmissionConfirmed, setTransmissionConfirmed] = useState(false);
  const [pgdasRecibo, setPgdasRecibo] = useState("•••••••••6789");
  const [pgdasTransmissionSubStep, setPgdasTransmissionSubStep] = useState<number>(0);
  const [pgdasDasValor, setPgdasDasValor] = useState(8420.36);
  const [pgdasVencimento, setPgdasVencimento] = useState("20/07/2026");

  const [pgdasFiles, setPgdasFiles] = useState<{ name: string; size: string; status: "processando" | "sucesso" | "erro" }[]>([]);
  const [isUploadingPgdas, setIsUploadingPgdas] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  // Helper for deleting a company
  const handleDeleteCompany = () => {
    if (companyToDelete) {
      setCompanies(prev => prev.filter(c => c.cnpj !== companyToDelete));
      addToast("Empresa removida com sucesso.", "success");
      setCompanyToDelete(null);
      setCurrentPage("dashboard");
    }
  };
  const pgdasFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingPgdas(true);
    setPgdasFiles([]);
    
    // Simulate processing
    setTimeout(() => {
      const newFiles = Array.from(files).map(f => ({ 
        name: f.name, 
        size: (f.size / 1024).toFixed(1) + " KB", 
        status: "sucesso" as const 
      }));
      setPgdasFiles(newFiles);
      setIsUploadingPgdas(false);
      addToast(`${files.length} XMLs importados e validados com sucesso!`, "success");
    }, 2000);
  };
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; lastModified: string } | null>(null);
  const [senhaCertificado, setSenhaCertificado] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [responsavelConfig, setResponsavelConfig] = useState("Naiale Augustinho");
  const [isValidatingCert, setIsValidatingCert] = useState(false);
  const [isValidatedCert, setIsValidatedCert] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [validationProgressMessage, setValidationProgressMessage] = useState("");
  const [certValidationProgress, setCertValidationProgress] = useState(0);
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [procuracaoId, setProcuracaoId] = useState("");
  const [procuracaoVencimento, setProcuracaoVencimento] = useState("");
  
  const [alerta30d, setAlerta30d] = useState(true);
  const [alerta15d, setAlerta15d] = useState(false);
  const [alerta7d, setAlerta7d] = useState(false);
  const [enviarAlertaPara, setEnviarAlertaPara] = useState("Responsável fiscal");
  const [emailAdicional, setEmailAdicional] = useState("financeiro@empresa.com.br");

  // ==========================================
  // STATE: PERFIL DO ESCRITÓRIO (OFFICE PROFILE)
  // ==========================================
  const [escritorioRazaoSocial, setEscritorioRazaoSocial] = useState("Alfa Serviços Contábeis Ltda.");
  const [escritorioNomeFantasia, setEscritorioNomeFantasia] = useState("Contabilidade Alfa");
  const [escritorioCnpj, setEscritorioCnpj] = useState("12.345.678/0001-99");
  const [escritorioInscricaoMunicipal, setEscritorioInscricaoMunicipal] = useState("987.654-3");
  const [escritorioDataAbertura, setEscritorioDataAbertura] = useState("15/01/2018");
  const [escritorioNaturezaJuridica, setEscritorioNaturezaJuridica] = useState("206-2 - Sociedade Empresária Limitada");
  const [escritorioSite, setEscritorioSite] = useState("www.contabilidadealfa.com.br");
  const [escritorioCep, setEscritorioCep] = useState("57020-000");
  const [escritorioLogradouro, setEscritorioLogradouro] = useState("Avenida da Paz");
  const [escritorioNumero, setEscritorioNumero] = useState("1420");
  const [escritorioComplemento, setEscritorioComplemento] = useState("Sala 301");
  const [escritorioBairro, setEscritorioBairro] = useState("Centro");
  const [escritorioMunicipio, setEscritorioMunicipio] = useState("Maceió");
  const [escritorioUf, setEscritorioUf] = useState("AL");
  const [escritorioTelefone, setEscritorioTelefone] = useState("(82) 3321-4455");
  const [escritorioWhatsapp, setEscritorioWhatsapp] = useState("(82) 99988-7766");
  const [escritorioEmailInstitucional, setEscritorioEmailInstitucional] = useState("contato@contabilidadealfa.com.br");
  const [escritorioEmailFinanceiro, setEscritorioEmailFinanceiro] = useState("financeiro@contabilidadealfa.com.br");
  const [escritorioEmailNotificacoes, setEscritorioEmailNotificacoes] = useState("alertas@contabilidadealfa.com.br");
  const [escritorioContatoAdministrativo, setEscritorioContatoAdministrativo] = useState("Carlos Alberto");
  const [escritorioStatus, setEscritorioStatus] = useState<"Em implantação" | "Ativo" | "Suspenso" | "Inativo" | "Cancelado">("Ativo");
  
  // State for SERPRO Credentials (as per reference image)
  const [ambienteFiscal, setAmbienteFiscal] = useState("Homologação");
  const [metodoAcesso, setMetodoAcesso] = useState<"certificado" | "procuracao">("certificado");
  const [consumerKey, setConsumerKey] = useState("env://INTEGRA_CONTADOR_KEY");
  const [consumerSecret, setConsumerSecret] = useState("env://INTEGRA_CONTADOR_SECRET");
  const [cnpjTitular, setCnpjTitular] = useState("53.855.352/0001-95");
  const [arquivoCertRef, setArquivoCertRef] = useState("env://INTEGRA_CONTADOR_CERT_PATH");
  const [senhaCertRef, setSenhaCertRef] = useState("env://INTEGRA_CONTADOR_CERT_PASS");
  const [identificadorCertificado, setIdentificadorCertificado] = useState("53855352000195 - AC SOLUTI");
  const [emissorCertificado, setEmissorCertificado] = useState("AC SOLUTI Multipla v5");
  const [validoDe, setValidoDe] = useState("2026-01-01");
  const [validoAte, setValidoAte] = useState("2027-01-01");

  const [escritorioPlano, setEscritorioPlano] = useState("Plano Profissional");
  const [escritorioLogoLetter, setEscritorioLogoLetter] = useState("A");
  const [escritorioLogoUrl, setEscritorioLogoUrl] = useState<string | null>(null);
  const [platformLogoUrl, setPlatformLogoUrl] = useState<string | null>(null);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);

  const escritorioLogoInputRef = useRef<HTMLInputElement>(null);
  const platformLogoInputRef = useRef<HTMLInputElement>(null);
  const userProfilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handleEscritorioLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("A imagem deve ter no máximo 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEscritorioLogoUrl(reader.result as string);
        addToast("Logotipo do escritório carregado com sucesso!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlatformLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("A imagem deve ter no máximo 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPlatformLogoUrl(reader.result as string);
        addToast("Logotipo da plataforma carregado com sucesso!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("A imagem deve ter no máximo 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUserProfilePhoto(reader.result as string);
        addToast("Foto de perfil carregada com sucesso!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // State for original/saved CNPJ to handle validation of CNPJ changes
  const [savedCnpj, setSavedCnpj] = useState("12.345.678/0001-99");
  const [isEditingCnpj, setIsEditingCnpj] = useState(false);
  const [cnpjConfirmOpen, setCnpjConfirmOpen] = useState(false);
  const [pendingCnpjValue, setPendingCnpjValue] = useState("");

  // Responsável Técnico State
  const [responsaveis, setResponsaveis] = useState([
    {
      id: "1",
      nome: "Marta Helena Souza",
      cpf: "123.456.789-00",
      email: "marta.helena@contabilidadealfa.com.br",
      telefone: "(82) 98888-1122",
      crc: "AL-012345/O",
      estadoCrc: "AL",
      categoria: "Contador",
      situacao: "Ativo",
      validadeCrc: "31/12/2026",
      principal: true,
    },
    {
      id: "2",
      nome: "Julio Cesar Pereira",
      cpf: "987.654.321-11",
      email: "julio.cesar@contabilidadealfa.com.br",
      telefone: "(82) 97777-2233",
      crc: "AL-054321/S",
      estadoCrc: "AL",
      categoria: "Técnico em Contabilidade",
      situacao: "Ativo",
      validadeCrc: "15/06/2027",
      principal: false,
    }
  ]);

  const [historicoResponsaveis, setHistoricoResponsaveis] = useState([
    {
      id: "hist-1",
      nomeAnterior: "Roberto Andrade Dias",
      dataInicial: "01/01/2018",
      dataFinal: "14/08/2023",
      usuarioSubstituicao: "Admin Geral",
    }
  ]);

  // Form states for adding/editing a Responsável Técnico
  const [showAddResponsavelModal, setShowAddResponsavelModal] = useState(false);
  const [respNome, setRespNome] = useState("");
  const [respCpf, setRespCpf] = useState("");
  const [respEmail, setRespEmail] = useState("");
  const [respTelefone, setRespTelefone] = useState("");
  const [respCrc, setRespCrc] = useState("");
  const [respEstadoCrc, setRespEstadoCrc] = useState("AL");
  const [respCategoria, setRespCategoria] = useState("Contador");
  const [respSituacao, setRespSituacao] = useState("Ativo");
  const [respValidadeCrc, setRespValidadeCrc] = useState("");
  const [respPrincipal, setRespPrincipal] = useState(false);

  // For editing profile state
  const [isEditingProfileForm, setIsEditingProfileForm] = useState(false);

  // Team and accesses list (for Team Tab)
  const [teamMembers, setTeamMembers] = useState([
    { id: "tm-1", nome: "Naiale Augustinho", email: "naiale@contabilidadealfa.com.br", cargo: "Analista Fiscal Sênior", status: "Ativo", acesso: "Administrador" },
    { id: "tm-2", nome: "Carlos Alberto", email: "carlos@contabilidadealfa.com.br", cargo: "Gerente Administrativo", status: "Ativo", acesso: "Operador" },
    { id: "tm-3", nome: "Ana Paula Silva", email: "anapaula@contabilidadealfa.com.br", cargo: "Assistente Fiscal", status: "Pendente", acesso: "Operador" }
  ]);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCargo, setInviteCargo] = useState("");
  const [inviteAcesso, setInviteAcesso] = useState("Operador");

  // Security Tab state
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([
    { id: "sl-1", evento: "Alteração de dados cadastrais", ip: "189.112.44.12", data: "11/07/2026 13:45", usuario: "Carlos Alberto" },
    { id: "sl-2", evento: "Login bem-sucedido", ip: "189.112.44.12", data: "11/07/2026 08:30", usuario: "Naiale Augustinho" }
  ]);

  // Additional Extended States for the 10 Tabs
  const [activeSessions, setActiveSessions] = useState([
    { id: "sess-1", ip: "189.112.44.12", navegador: "Chrome 126 (Windows)", local: "Maceió - AL", data: "Hoje, 14:15", atual: true },
    { id: "sess-2", ip: "177.34.19.102", navegador: "Safari (iPhone 15)", local: "Maceió - AL", data: "Ontem, 18:24", atual: false }
  ]);

  const [integrations, setIntegrations] = useState([
    { id: "receita", nome: "Receita Federal (e-CAC)", desc: "Sincronização de declarações PGDAS-D e pendências fiscais.", status: "Ativo", conexao: "Conectado" },
    { id: "sefaz", nome: "SEFAZ Estadual", desc: "Leitura automática de Notas Fiscais Eletrônicas (NF-e/CT-e).", status: "Ativo", conexao: "Conectado" },
    { id: "prefeitura", nome: "Prefeitura Municipal (NFS-e)", desc: "Importação automática de Notas de Serviço do município.", status: "Ativo", conexao: "Requer reautenticação" },
    { id: "caixa", nome: "Caixa Econômica Federal", desc: "Conectividade Social ICP, FGTS e guias de recolhimento.", status: "Inativo", conexao: "Não configurado" }
  ]);

  const [accentColor, setAccentColor] = useState<"emerald" | "indigo" | "rose" | "amber" | "slate">("emerald");
  const [defaultRegime, setDefaultRegime] = useState("Simples Nacional");
  const [defaultUf, setDefaultUf] = useState("AL");
  const [receiveEmailReport, setReceiveEmailReport] = useState(true);
  const [prefNotificationChannel, setPrefNotificationChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [prefAlertCrc, setPrefAlertCrc] = useState(true);
  const [prefAlertCert, setPrefAlertCert] = useState(true);
  const [prefAlertRobot, setPrefAlertRobot] = useState(true);
  const [prefSessionTimeout, setPrefSessionTimeout] = useState("30m");
  const [prefSecureConfirm, setPrefSecureConfirm] = useState(true);
  const [platformName, setPlatformName] = useState("PGDAS-D");
  const [platformInitials, setPlatformInitials] = useState("PG");
  const [transferOwnerOpen, setTransferOwnerOpen] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState("");

  const [billingLimitCompanies, setBillingLimitCompanies] = useState(150);
  const [billingBonusCredits, setBillingBonusCredits] = useState(0);
  const [billingDiscountPercent, setBillingDiscountPercent] = useState(15);
  const [billingInvoices, setBillingInvoices] = useState([
    { id: "inv-1", data: "10/07/2026", valor: 450.00, status: "Pago" },
    { id: "inv-2", data: "10/06/2026", valor: 450.00, status: "Pago" },
    { id: "inv-3", data: "10/05/2026", valor: 450.00, status: "Pago" }
  ]);

  // Transfer Responsibility Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
  const [transferTargetId, setTransferTargetId] = useState("");

  const [auditLogs, setAuditLogs] = useState([
    { id: "aud-1", data: "11/07/2026 14:10", usuario: "Naiale Augustinho", evento: "Alteração de dados cadastrais", valorAnterior: "CNPJ 12.345.678/0001-99", valorNovo: "CNPJ 12.345.678/0001-99", ip: "189.112.44.12", dispositivo: "Chrome/Windows" },
    { id: "aud-2", data: "11/07/2026 09:12", usuario: "Carlos Alberto", evento: "Envio de convite de equipe", valorAnterior: "-", valorNovo: "Convidado: Ana Paula Silva", ip: "189.112.44.12", dispositivo: "Firefox/Linux" },
    { id: "aud-3", data: "10/07/2026 17:30", usuario: "Admin Geral", evento: "Atualização de limite de plano", valorAnterior: "120 empresas", valorNovo: "150 empresas", ip: "192.168.1.1", dispositivo: "Control Plane" }
  ]);

  const addAuditLog = (evento: string, valorAnterior: string, valorNovo: string, usuario: string = "Naiale Augustinho") => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        data: formattedDate,
        usuario,
        evento,
        valorAnterior,
        valorNovo,
        ip: "189.112.44.12",
        dispositivo: "Chrome/Windows"
      },
      ...prev
    ]);
  };

  const getThemeColors = () => {
    switch (accentColor) {
      case "indigo":
        return {
          text: "text-indigo-600",
          bg: "bg-indigo-600",
          hoverBg: "hover:bg-indigo-700",
          border: "border-indigo-500",
          focus: "focus:border-indigo-500",
          lightBg: "bg-indigo-50",
          lightText: "text-indigo-700",
          lightBorder: "border-indigo-100",
          accentGlow: "shadow-indigo-500/15"
        };
      case "rose":
        return {
          text: "text-rose-600",
          bg: "bg-rose-600",
          hoverBg: "hover:bg-rose-700",
          border: "border-rose-500",
          focus: "focus:border-rose-500",
          lightBg: "bg-rose-50",
          lightText: "text-rose-700",
          lightBorder: "border-rose-100",
          accentGlow: "shadow-rose-500/15"
        };
      case "amber":
        return {
          text: "text-amber-600",
          bg: "bg-amber-600",
          hoverBg: "hover:bg-amber-700",
          border: "border-amber-500",
          focus: "focus:border-amber-500",
          lightBg: "bg-amber-50",
          lightText: "text-amber-700",
          lightBorder: "border-amber-100",
          accentGlow: "shadow-amber-500/15"
        };
      case "slate":
        return {
          text: "text-zinc-700",
          bg: "bg-zinc-700",
          hoverBg: "hover:bg-zinc-800",
          border: "border-zinc-500",
          focus: "focus:border-zinc-500",
          lightBg: "bg-zinc-100",
          lightText: "text-zinc-800",
          lightBorder: "border-zinc-200",
          accentGlow: "shadow-zinc-500/15"
        };
      default: // emerald
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-600",
          hoverBg: "hover:bg-emerald-700",
          border: "border-emerald-500",
          focus: "focus:border-emerald-500",
          lightBg: "bg-emerald-50",
          lightText: "text-emerald-700",
          lightBorder: "border-emerald-100",
          accentGlow: "shadow-emerald-500/15"
        };
    }
  };
  const theme = getThemeColors();

  // Formatter for Office CNPJ
  const handleEscritorioCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 14) val = val.substring(0, 14);
    
    let formatted = val;
    if (val.length > 12) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8, 12)}-${val.substring(12)}`;
    } else if (val.length > 8) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8)}`;
    } else if (val.length > 5) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5)}`;
    } else if (val.length > 2) {
      formatted = `${val.substring(0, 2)}.${val.substring(2)}`;
    }
    setEscritorioCnpj(formatted);
  };

  // Formatter for Office CEP
  const handleEscritorioCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);
    
    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    }
    setEscritorioCep(formatted);
  };

  // Formatter for WhatsApp / Telefone in Office
  const formatTelefoneGeneral = (valStr: string) => {
    let val = valStr.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);

    let formatted = val;
    if (val.length > 6) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      formatted = `(${val}`;
    }
    return formatted;
  };

  // Consult Office CEP
  const searchEscritorioCep = () => {
    const cleanCep = escritorioCep;
    if (!cleanCep || cleanCep.length < 9) {
      addToast("Insira um CEP válido para consulta (Ex: 30140-061)", "error");
      return;
    }
    addToast("Sincronizando endereço do CEP...", "info");
    setTimeout(() => {
      const data = mockCepData[cleanCep];
      if (data) {
        setEscritorioLogradouro(data.logradouro);
        setEscritorioBairro(data.bairro);
        setEscritorioMunicipio(data.municipio);
        setEscritorioUf(data.uf);
        addToast("Endereço do escritório atualizado via CEP!", "success");
      } else {
        addToast("CEP simulado preenchido com dados padrão.", "info");
        setEscritorioLogradouro("Rua Comercial do Centro");
        setEscritorioBairro("Centro");
        setEscritorioMunicipio("Maceió");
        setEscritorioUf("AL");
      }
    }, 600);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time CNPJ and CEP validations
  const isCnpjValid = cnpj.length === 18 && isValidCnpj(cnpj);
  const isCnpjIncomplete = cnpj.length > 0 && cnpj.length < 18;
  const isCnpjInvalidFormat = cnpj.length === 18 && !isValidCnpj(cnpj);

  const isCepValid = cep.length === 9;
  const isCepIncomplete = cep.length > 0 && cep.length < 9;

  // CNPJ Formatter (XX.XXX.XXX/XXXX-XX)
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 14) val = val.substring(0, 14);
    
    let formatted = val;
    if (val.length > 12) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8, 12)}-${val.substring(12)}`;
    } else if (val.length > 8) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5, 8)}/${val.substring(8)}`;
    } else if (val.length > 5) {
      formatted = `${val.substring(0, 2)}.${val.substring(2, 5)}.${val.substring(5)}`;
    } else if (val.length > 2) {
      formatted = `${val.substring(0, 2)}.${val.substring(2)}`;
    }
    setCnpj(formatted);
  };

  // CEP Formatter (XXXXX-XXX)
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);
    
    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    }
    setCep(formatted);
  };

  // Telefone Formatter ((XX) XXXXX-XXXX)
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);

    let formatted = val;
    if (val.length > 6) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      formatted = `(${val}`;
    }
    setTelefone(formatted);
  };

  // Simulate CNPJ Lookup
  const searchCnpj = () => {
    const cleanCnpj = cnpj;
    if (!cleanCnpj || cleanCnpj.length < 18) {
      addToast("Insira um CNPJ completo para buscar (Ex: 66.378.843/0001-34)", "error");
      return;
    }

    setIsSearchingCnpj(true);
    addToast("Buscando dados cadastrais na Receita Federal...", "info");

    setTimeout(() => {
      setIsSearchingCnpj(false);
      const data = mockCnpjData[cleanCnpj];
      if (data) {
        setRazaoSocial(data.razaoSocial);
        setNomeFantasia(data.nomeFantasia);
        setCep(data.cep);
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setMunicipio(data.municipio);
        setUf(data.uf);
        setEmail(data.email);
        setTelefone(data.telefone);
        setRegimeTributario(data.regimeTributario);
        setCnaePrincipal(data.cnaePrincipal);
        setCnaeSecundarios(data.cnaesSecundarios);
        setMunicipioIncidencia(data.municipioIncidencia);
        setDataAbertura("12/04/2015");
        addToast("Dados do CNPJ preenchidos com sucesso!", "success");
      } else {
        setRazaoSocial("EMPRESA SIMULADA LTDA");
        setNomeFantasia("Nome Fantasia Comercial");
        setCep("30140-061");
        setLogradouro("Avenida João Pinheiro");
        setBairro("Centro");
        setMunicipio("Belo Horizonte");
        setUf("MG");
        setEmail("contato@empresasimulada.com.br");
        setTelefone("(31) 98888-7777");
        setDataAbertura("01/10/2020");
        addToast("CNPJ simulado com sucesso na base padrão.", "info");
      }
    }, 1200);
  };

  // Simulate CEP Lookup
  const searchCep = () => {
    const cleanCep = cep;
    if (!cleanCep || cleanCep.length < 9) {
      addToast("Insira um CEP válido para consulta (Ex: 30140-061)", "error");
      return;
    }

    setIsSearchingCep(true);
    addToast("Consultando CEP na base integrada...", "info");

    setTimeout(() => {
      setIsSearchingCep(false);
      const data = mockCepData[cleanCep];
      if (data) {
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setMunicipio(data.municipio);
        setUf(data.uf);
        addToast("Endereço sincronizado com sucesso!", "success");
      } else {
        addToast("CEP simulado preenchido com dados padrão.", "info");
        setLogradouro("Rua de Teste");
        setBairro("Bairro de Teste");
        setMunicipio("Belo Horizonte");
        setUf("MG");
      }
    }, 800);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileSizeError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        setFileSizeError("O arquivo excede o limite de 10MB.");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pfx" || ext === "p12") {
        setUploadedFile({
          name: file.name,
          size: file.size > 1024 * 1024 
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                : `${(file.size / 1024).toFixed(1)} KB`,
          lastModified: new Date(file.lastModified).toLocaleDateString("pt-BR")
        });
        setIsValidatedCert(false);
        addToast("Arquivo do certificado carregado com sucesso!", "success");
      } else {
        addToast("Apenas arquivos .pfx ou .p12 são permitidos", "error");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSizeError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setFileSizeError("O arquivo excede o limite de 10MB.");
        return;
      }

      setUploadedFile({
        name: file.name,
        size: file.size > 1024 * 1024 
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
              : `${(file.size / 1024).toFixed(1)} KB`,
        lastModified: new Date().toLocaleDateString("pt-BR")
      });
      setIsValidatedCert(false);
      addToast("Arquivo do certificado carregado!", "success");
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate Certificate Validation with gorgeous interactive progress updates
  const validateCertificate = () => {
    if (!uploadedFile) {
      addToast("Faça upload de um certificado (.pfx ou .p12) antes de validar", "error");
      return;
    }
    if (!senhaCertificado) {
      addToast("Insira a senha do certificado para validação", "error");
      return;
    }

    setIsValidatingCert(true);
    setCertValidationProgress(15);
    setValidationProgressMessage("Decodificando chaves criptográficas .pfx...");
    addToast("Iniciando verificação do certificado digital...", "info");

    setTimeout(() => {
      setCertValidationProgress(55);
      setValidationProgressMessage("Estabelecendo canal seguro com a Receita Federal...");
      setTimeout(() => {
        setCertValidationProgress(85);
        setValidationProgressMessage("Autenticando CNPJ com as chaves do SERPRO...");
        setTimeout(() => {
          setCertValidationProgress(100);
          setIsValidatingCert(false);
          setIsValidatedCert(true);
          
          const expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 1);
          setCertExpiryDate(expDate.toLocaleDateString("pt-BR"));
          addToast("Certificado digital validado e autorizado! ICP-Brasil OK.", "success");
        }, 650);
      }, 650);
    }, 650);
  };

  const saveCertificateConfig = () => {
    if (selectedCompanyCnpj) {
      setCompanies(prev => prev.map(c => c.cnpj === selectedCompanyCnpj ? {
        ...c,
        statusAcesso: metodoAcesso === "certificado" ? "e-CNPJ Ativo" : "Procuração Ativa",
        // When configured, let's also mark its obligation status as Processando or Entregue
        statusPgdas: c.statusPgdas === "Pendente" ? "Processando" : c.statusPgdas
      } : c));
      const targetCompany = companies.find(c => c.cnpj === selectedCompanyCnpj);
      addToast(`Acesso fiscal configurado com sucesso para ${targetCompany?.razaoSocial || "a empresa"}!`, "success");
    } else {
      addToast("Configurações do certificado salvas com sucesso!", "success");
    }
    setCurrentPage("dashboard");
  };

  const saveCompanyConfig = () => {
    if (!razaoSocial) {
      addToast("Preencha ao menos a Razão Social para salvar a empresa", "error");
      return;
    }
    
    setIsSavingCompany(true);
    setIsSaveSuccess(false);

    // Simulate database persistence delay of 1.5 seconds
    setTimeout(() => {
      // Normalize CNPJ
      const targetCnpj = cnpj || "99.999.999/0001-99";
      const exists = companies.some(c => c.cnpj === targetCnpj);

      if (exists) {
        setCompanies(prev => prev.map(c => c.cnpj === targetCnpj ? {
          ...c,
          razaoSocial: razaoSocial.toUpperCase(),
          nomeFantasia: nomeFantasia ? nomeFantasia.toUpperCase() : razaoSocial.toUpperCase(),
          regimeTributario,
          tratamentoTributarioGlobal,
          uf: uf || "MG",
          municipio: municipio || "Belo Horizonte",
          statusEmpresa: status,
          logoUrl: companyLogoUrl
        } : c));
        addToast(`Empresa "${razaoSocial.toUpperCase()}" atualizada com sucesso!`, "success");
      } else {
        const newCompany: Company = {
          cnpj: targetCnpj,
          razaoSocial: razaoSocial.toUpperCase(),
          nomeFantasia: nomeFantasia ? nomeFantasia.toUpperCase() : razaoSocial.toUpperCase(),
          regimeTributario,
          tratamentoTributarioGlobal,
          uf: uf || "MG",
          municipio: municipio || "Belo Horizonte",
          statusAcesso: "Não Configurado",
          statusPgdas: "Pendente",
          periodoApuracao: "Junho/2026",
          statusEmpresa: status,
          logoUrl: companyLogoUrl
        };
        setCompanies(prev => [newCompany, ...prev]);
        addToast(`Empresa "${razaoSocial.toUpperCase()}" cadastrada com sucesso!`, "success");
        setShowNextStep(true);
      }
      
      // Visual checkmark transition
      setIsSavingCompany(false);
      setIsSaveSuccess(true);

      // Wait 1.2 seconds for the user to enjoy the high-fidelity checkmark feedback, then transition pages
      setTimeout(() => {
        setIsSaveSuccess(false);
        setCurrentPage("empresas");
      }, 1200);

    }, 1500);
  };

  const createNewCompany = () => {
    setCnpj("");
    setRazaoSocial("");
    setNomeFantasia("");
    setRegimeTributario("Simples Nacional");
    setTratamentoTributarioGlobal("AUTOMATICO SISTEMA");
    setUf("MG");
    setMunicipio("Belo Horizonte");
    setStatus("Ativa");
    setCep("");
    setLogradouro("");
    setBairro("");
    setNumero("");
    setComplemento("");
    setEmail("");
    setTelefone("");
    setCnaePrincipal("");
    setCnaeSecundarios("");
    setMunicipioIncidencia("");
    setDataAbertura("");
    setDataBaixa("");
    setCompanyLogoUrl(null);
    setCurrentPage("cadastro_empresa");
  };

  const editCompany = (company: Company) => {
    setCnpj(company.cnpj);
    setRazaoSocial(company.razaoSocial);
    setNomeFantasia(company.nomeFantasia);
    setRegimeTributario(company.regimeTributario);
    setTratamentoTributarioGlobal(company.tratamentoTributarioGlobal || "AUTOMATICO SISTEMA");
    setUf(company.uf);
    setMunicipio(company.municipio);
    setStatus(company.statusEmpresa || "Ativa");
    setCompanyLogoUrl(company.logoUrl || null);
    
    const mockDbEntry = mockCnpjData[company.cnpj] || {};
    setCep(mockDbEntry.cep || "30140-061");
    setLogradouro(mockDbEntry.logradouro || "Avenida João Pinheiro");
    setBairro(mockDbEntry.bairro || "Centro");
    setEmail(mockDbEntry.email || "financeiro@empresa.com.br");
    setTelefone(mockDbEntry.telefone || "(31) 98765-4321");
    setCnaePrincipal(mockDbEntry.cnaePrincipal || "62.01-5/01 - Desenvolvimento de programas de computador");
    setCnaeSecundarios(mockDbEntry.cnaeSecundarios || "");
    setMunicipioIncidencia(mockDbEntry.municipioIncidencia || `${company.municipio} - ${company.uf}`);
    setDataAbertura("12/04/2015");
    
    setCurrentPage("cadastro_empresa");
    addToast(`Carregando dados de "${company.razaoSocial}" para edição.`, "info");
  };

  const prefillLacunas = () => {
    setCnpj("66.378.843/0001-34");
    addToast("Clique na lupa ao lado do CNPJ para auto-preencher os dados cadastrais.", "info");
  };

  const renderUserDropdown = () => (
    <div className="relative group shrink-0" id="header-user-dropdown">
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl hover:bg-zinc-100/80 active:scale-95 transition-all cursor-pointer bg-zinc-50 text-zinc-900 shadow-xs h-9 select-none">
        <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm transition-all overflow-hidden">
          {userProfilePhoto ? (
            <img src={userProfilePhoto} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            "NA"
          )}
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 shrink-0 transition-colors" />
      </div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-lg border border-zinc-100 p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 border-b border-zinc-100 mb-2 flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {userProfilePhoto ? (
              <img src={userProfilePhoto} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              "NA"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-zinc-900 leading-tight">NAIALE AUGUSTINHO</p>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 truncate">naiale@contabilidadealfa.com</p>
          </div>
        </div>

        {/* Upload Profile Photo Section */}
        <div className="px-2 pb-2 border-b border-zinc-100 mb-2 space-y-1.5">
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Foto de Perfil</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => userProfilePhotoInputRef.current?.click()}
              className="flex-1 text-center py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 border border-zinc-200 cursor-pointer h-7"
            >
              <Camera className="h-3 w-3 text-zinc-400" />
              {userProfilePhoto ? "Alterar" : "Enviar foto"}
            </button>
            {userProfilePhoto && (
              <button
                onClick={() => {
                  setUserProfilePhoto(null);
                  addToast("Foto de perfil removida com sucesso.", "info");
                }}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-colors cursor-pointer h-7 w-7 flex items-center justify-center shrink-0"
                title="Remover foto"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={userProfilePhotoInputRef}
            onChange={handleUserProfilePhotoUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <button 
          onClick={() => addToast("Meu Perfil indisponível neste protótipo.", "info")}
          className="w-full text-left px-2.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
        >
          <User className="h-3.5 w-3.5" /> Meu Perfil
        </button>
        <button 
          onClick={() => addToast("Configurações indisponíveis neste protótipo.", "info")}
          className="w-full text-left px-2.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" /> Configurações
        </button>
        <button 
          onClick={() => addToast("Sessão encerrada neste protótipo.", "info")}
          className="w-full text-left px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
        >
          <LockKeyhole className="h-3.5 w-3.5" /> Sair
        </button>
      </div>
    </div>
  );

  // Filtered and Paginated Companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""));
    
    const matchesRegime = 
      filterRegime === "all" || 
      c.regimeTributario.includes(filterRegime);
    
    const matchesAcesso = 
      filterAcesso === "all" || 
      (filterAcesso === "Configurado" && c.statusAcesso !== "Não Configurado") ||
      (filterAcesso === "Não Configurado" && c.statusAcesso === "Não Configurado");

    const matchesStatus = 
      filterStatus === "all" ||
      c.statusEmpresa === filterStatus ||
      (filterStatus === "Ativa" && !c.statusEmpresa);

    const matchesPgdas =
      filterPgdas === "all" ||
      c.statusPgdas === filterPgdas;

    return matchesSearch && matchesRegime && matchesAcesso && matchesStatus && matchesPgdas;
  });

  const totalCompaniesItems = filteredCompanies.length;
  const totalCompaniesPages = Math.ceil(totalCompaniesItems / companiesPerPage);
  const activeCompaniesPage = Math.min(companiesPage, totalCompaniesPages || 1);
  const startCompanyIndex = (activeCompaniesPage - 1) * companiesPerPage;
  const paginatedCompanies = filteredCompanies.slice(startCompanyIndex, startCompanyIndex + companiesPerPage);

  const isEditingCompany = companies.some(c => c.cnpj === cnpj);

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col md:flex-row font-sans text-zinc-800 antialiased selection:bg-emerald-500/10 selection:text-emerald-700">
      
      {/* Dynamic Toast System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border flex items-start gap-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-white border-emerald-100 text-emerald-900"
                  : toast.type === "error"
                  ? "bg-white border-rose-100 text-rose-900"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" /></div>}
                {toast.type === "error" && <div className="p-1 rounded-lg bg-rose-50 text-rose-600"><AlertCircle className="h-4 w-4" /></div>}
                {toast.type === "info" && <div className="p-1 rounded-lg bg-zinc-100 text-zinc-600"><Info className="h-4 w-4" /></div>}
              </div>
              <div className="flex-1 text-sm font-medium pr-1">{toast.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE TOP HEADER BAR */}
      <header className="md:hidden bg-zinc-900 text-white px-5 py-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-inner overflow-hidden">
            {platformLogoUrl ? (
              <img src={platformLogoUrl || undefined} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              platformInitials
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-zinc-100">{platformName}</h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Plataforma Fiscal Premium</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Profile in Mobile Header */}
          <div className="flex items-center gap-2 p-1 px-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60" id="mobile-header-user">
            <div className="h-6 w-6 rounded bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {userProfilePhoto ? (
                <img src={userProfilePhoto} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                "NA"
              )}
            </div>
            <span className="text-[10px] font-bold text-zinc-300 max-w-[80px] truncate hidden xs:inline">Naiale</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none text-zinc-400 hover:text-white"
            id="mobile-menu-toggle"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`bg-zinc-950 text-zinc-300 flex-col justify-between shrink-0 transition-all duration-300 ease-in-out fixed md:sticky top-0 h-screen z-45 flex border-r border-zinc-900 shadow-xl ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${sidebarOpen ? "left-0" : "-left-64 md:left-0"}`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-900/60 flex justify-between items-center h-16 shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? "opacity-0 md:opacity-100 scale-90" : "opacity-100"}`}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black tracking-widest text-base shadow-md shadow-emerald-500/15 shrink-0 overflow-hidden">
              {platformLogoUrl ? (
                <img src={platformLogoUrl || undefined} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                platformInitials
              )}
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-extrabold text-white text-base tracking-tight leading-none font-display">{platformName}</h1>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all focus:outline-none"
            id="sidebar-collapse-toggle"
            title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronRight className={`h-4 w-4 transform transition-transform duration-300 ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5">
          {/* Workspace Switcher Removed */}
          
          {currentWorkspace === "admin" ? (
            <>
              {/* Menu Item - Escritórios Contábeis */}
              <button
                onClick={() => { setCurrentPage("dashboard"); setSidebarOpen(false); addToast("Módulo de Escritórios indisponível neste protótipo", "info") }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <Layers 
                    className="h-4.5 w-4.5 text-zinc-300 group-hover:text-zinc-100" 
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                  Escritórios Contábeis
                </span>
              </button>
            </>
          ) : (
            <>
              {/* SECTION: PRINCIPAL */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2 mt-4">Principal</div>}

              {/* Menu Item - Dashboard */}
              <button
                onClick={() => { setCurrentPage("dashboard"); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "dashboard"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
                id="nav-dashboard"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <LayoutDashboard 
                      className={`h-4.5 w-4.5 ${
                        currentPage === "dashboard" ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} 
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Dashboard
                  </span>
                </div>
              </button>

              {/* SECTION: ESCRITÓRIO */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2 mt-6">Escritório</div>}

              {/* Menu Item - Perfil */}
              <button
                onClick={() => {
                  setCurrentPage("perfil_escritorio");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "perfil_escritorio"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <UserCircle 
                      className={`h-4.5 w-4.5 ${
                        currentPage === "perfil_escritorio" ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} 
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Perfil do Escritório
                  </span>
                </div>
              </button>

              {/* SECTION: GESTÃO DE CLIENTES */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2 mt-6">Gestão de Clientes</div>}

              {/* Menu Item - Empresas */}
              <button
                onClick={() => {
                  setCurrentPage("empresas");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  (currentPage === "empresas" || currentPage === "cadastro_empresa")
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <Building 
                      className={`h-4.5 w-4.5 ${
                        (currentPage === "empresas" || currentPage === "cadastro_empresa") ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} 
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Empresas
                  </span>
                </div>
              </button>

              {/* SECTION: DEPARTAMENTO FISCAL */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2 mt-6">Departamento Fiscal</div>}

              {/* Menu Item - Fiscal */}
              <button
                onClick={() => setIsFiscalMenuOpen(!isFiscalMenuOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "pgdas"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
                id="nav-fiscal"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <Landmark
                      className={`h-4.5 w-4.5 ${
                        currentPage === "pgdas" ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Obrigações Fiscais
                  </span>
                </div>
                {!sidebarCollapsed && (
                  <div className={`transition-transform duration-200 ${isFiscalMenuOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  </div>
                )}
              </button>
              
              {/* Fiscal Submenu */}
              {isFiscalMenuOpen && !sidebarCollapsed && (
                <div className="pl-9 pr-4 mt-1 transition-all duration-300">
                  <div className="relative border-l border-zinc-800/80 py-1 space-y-0.5 ml-2.5">
                    <button 
                      onClick={() => { setCurrentPage("pgdas"); setSidebarOpen(false); }} 
                      className={`w-full flex items-center gap-3 pl-5 pr-3 py-2 rounded-lg text-[12px] font-semibold transition-all relative group ${
                        currentPage === "pgdas" 
                          ? "text-zinc-100 bg-zinc-800/40" 
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/20"
                      }`}
                    >
                      {/* Node indicator */}
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-zinc-800 transition-colors ${
                        currentPage === "pgdas" ? "bg-emerald-500 border-emerald-500/50" : "bg-zinc-900"
                      }`}></div>

                      <FileCheck className={`h-3.5 w-3.5 transition-colors ${currentPage === "pgdas" ? "text-emerald-500" : "text-zinc-600 group-hover:text-zinc-400"}`} strokeWidth={2.5} />
                      Apuração PGDAS
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: CONFIGURAÇÕES */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2 mt-6">Configurações</div>}

              {/* Menu Item - Certificados */}
              <button
                onClick={() => {
                  setCurrentPage("certificados");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "certificados"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
                id="nav-certificados"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <ShieldCheck
                      className={`h-4.5 w-4.5 ${
                        currentPage === "certificados" ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Certificados Digitais
                  </span>
                </div>
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-40 md:hidden"
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-5 py-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-300 relative">
        
        <AnimatePresence mode="wait">
        {/* ====================================================================
            VIEW: PERFIL DO ESCRITÓRIO
            ==================================================================== */}
        {currentPage === "perfil_escritorio" && (
          <motion.div
            key="perfil_escritorio"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header: Perfil do Escritório */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  <span>Escritório</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Perfil do Escritório</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Perfil do Escritório</h2>
                <p className="text-sm text-zinc-500 mt-1">Gerencie os dados cadastrais, logos e informações do seu escritório contábil.</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {isEditingProfileForm ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditingProfileForm(false);
                        addToast("Edição cadastral descartada.", "info");
                      }}
                      className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 active:scale-95 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer shadow-sm select-none"
                    >
                      Descartar
                    </button>
                    <button 
                      onClick={() => {
                        if (!escritorioNomeFantasia || !escritorioRazaoSocial) {
                          addToast("Preencha ao menos Nome Fantasia e Razão Social", "error");
                          return;
                        }
                        if (escritorioCnpj !== savedCnpj) {
                          // Exige confirmação adicional de CNPJ
                          setPendingCnpjValue(escritorioCnpj);
                          setCnpjConfirmOpen(true);
                        } else {
                          setIsEditingProfileForm(false);
                          addToast("Cadastro do escritório salvo com sucesso!", "success");
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer select-none"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setProfileTab("dados");
                      setIsEditingProfileForm(true);
                      addToast("Modo de edição cadastral ativado!", "info");
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm hover:shadow-md select-none"
                  >
                    Editar cadastro
                  </button>
                )}
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* Header: Logotipo, Nome, CNPJ, Status, Plano */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="h-24 bg-zinc-900/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-15 mix-blend-overlay"></div>
              </div>
              <div className="px-6 sm:px-8 pb-8 pt-0 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
                <div className="h-24 w-24 rounded-2xl bg-white p-2 border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center relative group">
                  {escritorioLogoUrl ? (
                    <img src={escritorioLogoUrl || undefined} alt="Logo" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <div className="bg-emerald-600 w-full h-full rounded-xl flex items-center justify-center text-white font-display font-black text-3xl uppercase shadow-inner">
                      {escritorioLogoLetter || "A"}
                    </div>
                  )}
                  {isEditingProfileForm && (
                    <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl gap-1">
                      <button 
                        onClick={() => {
                          escritorioLogoInputRef.current?.click();
                        }}
                        className="text-[9px] font-black hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" /> Imagem
                      </button>
                      <button 
                        onClick={() => {
                          const nextLetters = ["A", "B", "C", "K", "S", "X"];
                          const currentIdx = nextLetters.indexOf(escritorioLogoLetter);
                          const nextLetter = nextLetters[(currentIdx + 1) % nextLetters.length];
                          setEscritorioLogoLetter(nextLetter);
                          setEscritorioLogoUrl(null);
                          addToast(`Logotipo alterado para a letra "${nextLetter}"`, "info");
                        }}
                        className="text-[9px] font-black hover:underline cursor-pointer"
                      >
                        Alternar Letras
                      </button>
                      {escritorioLogoUrl && (
                        <button 
                          onClick={() => {
                            setEscritorioLogoUrl(null);
                            addToast("Logotipo do escritório removido.", "info");
                          }}
                          className="text-[9px] font-black text-rose-300 hover:underline cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  )}
                  <input 
                    type="file"
                    ref={escritorioLogoInputRef}
                    onChange={handleEscritorioLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1 space-y-2 pt-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight font-display leading-none">
                          {escritorioNomeFantasia}
                        </h1>
                      </div>
                      <p className="text-sm font-semibold text-zinc-500 mt-1.5">{escritorioRazaoSocial}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 items-center pt-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200/50">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      CNPJ: {escritorioCnpj}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200/50">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {escritorioMunicipio} - {escritorioUf}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-md border border-indigo-200/50">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      {escritorioPlano}
                    </span>
                  </div>
                </div>
              </div>
            </div>



            {/* Content Tabs */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {/* ABA: VISÃO GERAL */}
                {false && (
                  <motion.div
                    key="visao_geral"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="space-y-6"
                  >
                  {/* A. Indicadores Rápidos (Cartões Clicáveis) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                      onClick={() => {
                        setCurrentPage("dashboard");
                        addToast("Redirecionando para Gerenciar Empresas...", "info");
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Empresas Clientes</p>
                          <p className="text-2xl font-black text-zinc-900 mt-1">{companies.length}</p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {companies.filter(c => c.statusEmpresa === "Ativa").length || companies.length} ativas
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                          <Building className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setProfileTab("equipe")}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Equipe do Escritório</p>
                          <p className="text-2xl font-black text-zinc-900 mt-1">{teamMembers.length}</p>
                          <p className="text-[10px] text-zinc-500 font-bold mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                            {teamMembers.filter(t => t.status === "Pendente").length} convite pendente
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 group-hover:scale-105 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setProfileTab("responsaveis")}
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Responsáveis Técnicos</p>
                          <p className="text-2xl font-black text-zinc-900 mt-1">{responsaveis.length}</p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Principal: {responsaveis.find(r => r.principal)?.nome.split(" ")[0] || "Naiale"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                          <Shield className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    <a 
                      href="#pendencias-section"
                      className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20 block"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Pendências Ativas</p>
                          <p className="text-2xl font-black text-amber-600 mt-1">4</p>
                          <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            Requerem atenção
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                          <AlertCircle className="w-5 h-5 animate-pulse" />
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* B. Pendências e Atenção Necessária */}
                  <div id="pendencias-section" className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Pendências e Atenção Necessária
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Ações prioritárias recomendadas para manter o compliance administrativo e fiscal do escritório.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Item 1 */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-rose-100 bg-rose-50/20 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Critica</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Responsável Técnico</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-900">CRC do Responsável Técnico está próximo do vencimento</p>
                          <p className="text-[11px] text-zinc-500">O registro profissional do contador principal expira em breve. Atualize o documento para evitar interrupções operacionais.</p>
                        </div>
                        <button 
                          onClick={() => setProfileTab("responsaveis")}
                          className="px-3.5 py-1.5 bg-zinc-100 hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                        >
                          Resolver agora
                        </button>
                      </div>

                      {/* Item 2 */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-amber-100 bg-amber-50/20 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Atenção</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Cadastro</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-900">Cadastro do escritório incompleto (Falta WhatsApp Corporativo)</p>
                          <p className="text-[11px] text-zinc-500">Seu perfil do escritório está com 85% de completude. Complete as informações de contatos e canais.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setProfileTab("dados");
                            setIsEditingProfileForm(true);
                            addToast("Foque no bloco 'Contatos e canais' e adicione o WhatsApp!", "info");
                          }}
                          className="px-3.5 py-1.5 bg-zinc-100 hover:bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                        >
                          Preencher dados
                        </button>
                      </div>

                      {/* Item 3 */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-zinc-200 text-zinc-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Informativa</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Equipe</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-900">Convite de equipe pendente há mais de 3 dias</p>
                          <p className="text-[11px] text-zinc-500">Ana Paula Silva (anapaula@contabilidadealfa.com.br) ainda não aceitou o convite de acesso.</p>
                        </div>
                        <button 
                          onClick={() => setProfileTab("equipe")}
                          className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                        >
                          Ver equipe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* C & D. Linha de Resumos Cadastrais */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* C. Resumo Dados do Escritório */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                        <h4 className="text-xs font-extrabold text-zinc-955 uppercase tracking-wider flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-emerald-500" />
                          Dados Cadastrais Resumidos
                        </h4>
                        <button 
                          onClick={() => setProfileTab("dados")}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Ver dados completos
                        </button>
                      </div>

                      <div className="space-y-3 text-xs text-zinc-700 font-semibold">
                        <div className="flex justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-400">Razão Social</span>
                          <span className="text-zinc-900">{escritorioRazaoSocial}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-400">E-mail Institucional</span>
                          <span className="text-zinc-900 break-all text-right">{escritorioEmailInstitucional}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-400">Telefone Principal</span>
                          <span className="text-zinc-900">{escritorioTelefone}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-zinc-400">Localização</span>
                          <span className="text-zinc-900">{escritorioMunicipio} - {escritorioUf}</span>
                        </div>
                      </div>
                    </div>

                    {/* D. Resumo Responsável Técnico Principal */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                        <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          Responsável Técnico Principal
                        </h4>
                        <button 
                          onClick={() => setProfileTab("responsaveis")}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Gerenciar responsáveis
                        </button>
                      </div>

                      {responsaveis.find(r => r.principal) ? (
                        <div className="space-y-3 text-xs text-zinc-700 font-semibold">
                          <div className="flex justify-between py-1 border-b border-zinc-50">
                            <span className="text-zinc-400">Nome</span>
                            <span className="text-zinc-900 font-bold">{responsaveis.find(r => r.principal)?.nome}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-50">
                            <span className="text-zinc-400">CRC Legal</span>
                            <span className="text-zinc-900">{responsaveis.find(r => r.principal)?.crc} ({responsaveis.find(r => r.principal)?.estadoCrc})</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-50">
                            <span className="text-zinc-400">Situação Cadastral</span>
                            <span className="text-emerald-600 font-bold">{responsaveis.find(r => r.principal)?.situacao}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-zinc-400">Validade CRC</span>
                            <span className="text-zinc-900">{responsaveis.find(r => r.principal)?.validadeCrc || "Ininterrupto"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-zinc-400 font-semibold text-xs">
                          Nenhum responsável técnico principal definido!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* E & F. Linha de Clientes e Equipe */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* E. Carteira de Clientes */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                        <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-emerald-500" />
                          Carteira de Clientes (Operacional)
                        </h4>
                        <button 
                          onClick={() => {
                            setCurrentPage("dashboard");
                            addToast("Abra a área de Empresas para editar cadastros individuais.", "info");
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Gerenciar empresas
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Empresas Cadastradas</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">{companies.length}</p>
                          </div>
                          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Optantes Simples</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">
                              {companies.filter(c => c.regimeTributario === "Simples Nacional").length || 3}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Últimas empresas adicionadas:</div>
                        <div className="space-y-1.5 text-xs">
                          {companies.slice(0, 2).map((c, idx) => (
                            <div key={idx} className="flex justify-between items-center text-zinc-700 font-semibold py-1 px-2 hover:bg-zinc-50 rounded-lg">
                              <span className="truncate max-w-[180px]">{c.razaoSocial}</span>
                              <span className="text-zinc-400 text-[10px]">{c.cnpj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* F. Equipe e Acessos */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                        <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500" />
                          Equipe e Acessos do Escritório
                        </h4>
                        <button 
                          onClick={() => setProfileTab("equipe")}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Gerenciar equipe
                        </button>
                      </div>

                      <div className="space-y-2.5 text-xs text-zinc-700 font-semibold">
                        <div className="flex justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-400">Proprietário Legal</span>
                          <span className="text-zinc-900 font-bold">Naiale Augustinho</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-400">Usuários Administradores</span>
                          <span className="text-zinc-900">
                            {teamMembers.filter(t => t.acesso === "Administrador").length} operador(es)
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-zinc-400">Convites Aguardando Aceite</span>
                          <span className="text-zinc-900 font-bold text-amber-600">
                            {teamMembers.filter(t => t.status === "Pendente").length} pendente(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* G. Atividade Recente (Somente com dados reais) */}
                  {auditLogs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                      <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Histórico de Atividade Recente (Auditoria do Escritório)
                      </h4>

                      <div className="divide-y divide-zinc-50 text-xs">
                        {auditLogs.slice(0, 5).map((log) => (
                          <div key={log.id} className="flex justify-between items-center py-2.5 hover:bg-zinc-50/50 px-2 rounded-lg transition-colors">
                            <div className="space-y-0.5">
                              <p className="font-bold text-zinc-900">{log.evento}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">Operado por: <span className="font-bold text-zinc-600">{log.usuario}</span></p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">{log.data}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ABA 1: DADOS CADASTRAIS */}
              {profileTab === "dados" && (
                <motion.div
                  key="dados"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-8"
                >
                  {isEditingProfileForm && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs font-semibold text-amber-800 flex items-center gap-3">
                      <Info className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>
                        Você está no <strong>Modo de Edição</strong>. Altere as informações abaixo e clique em <strong>Salvar Alterações</strong> no topo. Se alterar o CNPJ legal, uma confirmação de segurança será exibida.
                      </span>
                    </div>
                  )}

                  {/* BLOCO 1: DADOS DA EMPRESA */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
                      1. Dados da empresa
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Razão Social</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioRazaoSocial}
                          onChange={(e) => setEscritorioRazaoSocial(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Nome Fantasia</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioNomeFantasia}
                          onChange={(e) => setEscritorioNomeFantasia(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                          CNPJ do Escritório
                          {isEditingProfileForm && (
                            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-100 px-1.5 rounded">Exige confirmação</span>
                          )}
                        </label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          placeholder="00.000.000/0000-00"
                          value={escritorioCnpj}
                          onChange={handleEscritorioCnpjChange}
                          className={`w-full bg-zinc-50/70 border disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors ${
                            escritorioCnpj.length === 18 ? "border-zinc-200" : "border-rose-300 focus:border-rose-500 bg-rose-50/10"
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Inscrição Municipal</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioInscricaoMunicipal}
                          onChange={(e) => setEscritorioInscricaoMunicipal(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Data de Abertura</label>
                        <input 
                          type="text" 
                          placeholder="DD/MM/AAAA"
                          disabled={!isEditingProfileForm}
                          value={escritorioDataAbertura}
                          onChange={(e) => setEscritorioDataAbertura(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Natureza Jurídica</label>
                        <select 
                          disabled={!isEditingProfileForm}
                          value={escritorioNaturezaJuridica}
                          onChange={(e) => setEscritorioNaturezaJuridica(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        >
                          <option value="206-2 - Sociedade Empresária Limitada">206-2 - Sociedade Empresária Limitada</option>
                          <option value="213-5 - Empresário Individual">213-5 - Empresário Individual</option>
                          <option value="230-5 - Empresa Individual de Responsabilidade Limitada">230-5 - Empresa Individual de Responsabilidade Limitada</option>
                          <option value="399-9 - Associação Privada">399-9 - Associação Privada</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Endereço Web (Site)</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioSite}
                          onChange={(e) => setEscritorioSite(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Logotipo Letra de Exibição</label>
                        <input 
                          type="text" 
                          maxLength={2}
                          disabled={!isEditingProfileForm}
                          value={escritorioLogoLetter}
                          onChange={(e) => setEscritorioLogoLetter(e.target.value.toUpperCase())}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-emerald-500 transition-colors text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Logotipo do Escritório (Imagem)</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!isEditingProfileForm}
                            onClick={() => escritorioLogoInputRef.current?.click()}
                            className="flex-1 py-2 bg-zinc-50/70 hover:bg-zinc-100 disabled:bg-zinc-100/50 disabled:text-zinc-400 border border-zinc-200 rounded-xl text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" /> {escritorioLogoUrl ? "Alterar Logo" : "Upload Imagem"}
                          </button>
                          {escritorioLogoUrl && (
                            <button
                              type="button"
                              disabled={!isEditingProfileForm}
                              onClick={() => {
                                setEscritorioLogoUrl(null);
                                addToast("Logotipo de imagem do escritório removido.", "info");
                              }}
                              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 disabled:bg-zinc-100/50 border border-rose-100 rounded-xl text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Nome da Plataforma (Menu)</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={platformName}
                          onChange={(e) => setPlatformName(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Ex: PGDAS-D"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Iniciais do Logotipo (Menu)</label>
                        <input 
                          type="text" 
                          maxLength={3}
                          disabled={!isEditingProfileForm}
                          value={platformInitials}
                          onChange={(e) => setPlatformInitials(e.target.value.toUpperCase())}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-emerald-500 transition-colors text-center font-mono"
                          placeholder="Ex: PG"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Logotipo da Plataforma (Imagem)</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!isEditingProfileForm}
                            onClick={() => platformLogoInputRef.current?.click()}
                            className="flex-1 py-2 bg-zinc-50/70 hover:bg-zinc-100 disabled:bg-zinc-100/50 disabled:text-zinc-400 border border-zinc-200 rounded-xl text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" /> {platformLogoUrl ? "Alterar Logo" : "Upload Imagem"}
                          </button>
                          {platformLogoUrl && (
                            <button
                              type="button"
                              disabled={!isEditingProfileForm}
                              onClick={() => {
                                setPlatformLogoUrl(null);
                                addToast("Logotipo de imagem da plataforma removido.", "info");
                              }}
                              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 disabled:bg-zinc-100/50 border border-rose-100 rounded-xl text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <input 
                          type="file"
                          ref={platformLogoInputRef}
                          onChange={handlePlatformLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BLOCO 2: ENDEREÇO */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-2">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        2. Endereço comercial
                      </h3>
                      {isEditingProfileForm && (
                        <button 
                          onClick={searchEscritorioCep}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-1 rounded"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Consultar CEP automaticamente
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center justify-between">
                          <span>CEP</span>
                          {isEditingProfileForm && (
                            <span className="text-[9px] text-zinc-400">Pressione Consultar</span>
                          )}
                        </label>
                        <input 
                          type="text" 
                          placeholder="00000-000"
                          disabled={!isEditingProfileForm}
                          value={escritorioCep}
                          onChange={handleEscritorioCepChange}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Logradouro / Avenida</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioLogradouro}
                          onChange={(e) => setEscritorioLogradouro(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Número</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioNumero}
                          onChange={(e) => setEscritorioNumero(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Complemento</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioComplemento}
                          onChange={(e) => setEscritorioComplemento(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Bairro</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioBairro}
                          onChange={(e) => setEscritorioBairro(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Município</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioMunicipio}
                          onChange={(e) => setEscritorioMunicipio(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Estado (UF)</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioUf}
                          onChange={(e) => setEscritorioUf(e.target.value.toUpperCase())}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-emerald-500 transition-colors text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BLOCO 3: CONTATOS */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
                      3. Contatos e e-mails de canais
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Telefone Principal</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioTelefone}
                          onChange={(e) => setEscritorioTelefone(formatTelefoneGeneral(e.target.value))}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">WhatsApp Corporativo</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioWhatsapp}
                          onChange={(e) => setEscritorioWhatsapp(formatTelefoneGeneral(e.target.value))}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">Nome Contato Administrativo</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfileForm}
                          value={escritorioContatoAdministrativo}
                          onChange={(e) => setEscritorioContatoAdministrativo(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">E-mail Institucional</label>
                        <input 
                          type="email" 
                          disabled={!isEditingProfileForm}
                          value={escritorioEmailInstitucional}
                          onChange={(e) => setEscritorioEmailInstitucional(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">E-mail Financeiro</label>
                        <input 
                          type="email" 
                          disabled={!isEditingProfileForm}
                          value={escritorioEmailFinanceiro}
                          onChange={(e) => setEscritorioEmailFinanceiro(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase">E-mail para Notificações</label>
                        <input 
                          type="email" 
                          disabled={!isEditingProfileForm}
                          value={escritorioEmailNotificacoes}
                          onChange={(e) => setEscritorioEmailNotificacoes(e.target.value)}
                          className="w-full bg-zinc-50/70 border border-zinc-200 disabled:bg-zinc-100/50 disabled:text-zinc-600 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* CNPJ CHANGES EXTREME SAFETY WARNING DIALOG MODAL */}
            {cnpjConfirmOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6"
                >
                  <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <AlertCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-black text-zinc-900 font-display">Confirmar alteração de CNPJ?</h3>
                    <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                      Você está alterando o CNPJ do escritório de <strong className="text-zinc-800">{savedCnpj}</strong> para <strong className="text-emerald-700">{pendingCnpjValue}</strong>.
                    </p>
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl leading-relaxed text-left">
                      <strong>Atenção:</strong> Alterações de CNPJ legal mudam a identidade tributária e o vínculo de segurança de todos os certificados cadastrados. Esta operação exige auditoria.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setCnpjConfirmOpen(false);
                        setEscritorioCnpj(savedCnpj);
                        addToast("Alteração de CNPJ abortada com segurança.", "info");
                      }}
                      className="flex-1 px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-zinc-200 transition-all duration-200 cursor-pointer h-8 flex items-center justify-center select-none"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        setSavedCnpj(pendingCnpjValue);
                        setEscritorioCnpj(pendingCnpjValue);
                        setCnpjConfirmOpen(false);
                        setIsEditingProfileForm(false);
                        addToast("CNPJ alterado e atualizado no cadastro legal!", "success");
                        // Log event
                        setSecurityLogs(prev => [
                          {
                            id: `sl-${Date.now()}`,
                            evento: `Alteração drástica de CNPJ legal para ${pendingCnpjValue}`,
                            ip: "189.112.44.12",
                            data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                            usuario: "Admin Geral"
                          },
                          ...prev
                        ]);
                      }}
                      className="flex-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer h-8 flex items-center justify-center select-none"
                    >
                      Confirmar CNPJ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* MODAL: ADICIONAR RESPONSÁVEL TÉCNICO */}
            {showAddResponsavelModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 md:p-8 max-w-lg w-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="text-base font-extrabold text-zinc-900 uppercase tracking-tight font-display">Adicionar Contador Técnico</h3>
                    <button 
                      onClick={() => setShowAddResponsavelModal(false)}
                      className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-700">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome Completo</label>
                      <input 
                        type="text" 
                        value={respNome} 
                        onChange={(e) => setRespNome(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="Ex: Marta Souza"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CPF</label>
                      <input 
                        type="text" 
                        value={respCpf} 
                        onChange={(e) => setRespCpf(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Telefone</label>
                      <input 
                        type="text" 
                        value={respTelefone} 
                        onChange={(e) => setRespTelefone(formatTelefoneGeneral(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">E-mail</label>
                      <input 
                        type="email" 
                        value={respEmail} 
                        onChange={(e) => setRespEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="email@contabilidade.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CRC (Registro)</label>
                      <input 
                        type="text" 
                        value={respCrc} 
                        onChange={(e) => setRespCrc(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="AL-000000/O"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Estado CRC</label>
                      <input 
                        type="text" 
                        value={respEstadoCrc} 
                        onChange={(e) => setRespEstadoCrc(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none text-center focus:border-emerald-500 font-bold"
                        maxLength={2}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Categoria</label>
                      <select 
                        value={respCategoria} 
                        onChange={(e) => setRespCategoria(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                      >
                        <option value="Contador">Contador</option>
                        <option value="Técnico em Contabilidade">Técnico em Contabilidade</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Data Validade CRC</label>
                      <input 
                        type="text" 
                        value={respValidadeCrc} 
                        onChange={(e) => setRespValidadeCrc(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="DD/MM/AAAA"
                      />
                    </div>

                    <div className="col-span-2 pt-2 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="respPrincipal"
                        checked={respPrincipal}
                        onChange={(e) => setRespPrincipal(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="respPrincipal" className="text-xs text-zinc-600 font-bold select-none cursor-pointer">Definir como responsável técnico principal do escritório</label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <button 
                      onClick={() => setShowAddResponsavelModal(false)}
                      className="flex-1 px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-zinc-200 transition-all duration-200 cursor-pointer h-8 flex items-center justify-center select-none"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (!respNome || !respCrc || !respCpf) {
                          addToast("Preencha Nome, CPF e CRC!", "error");
                          return;
                        }

                        const newResp = {
                          id: `resp-${Date.now()}`,
                          nome: respNome,
                          cpf: respCpf,
                          email: respEmail || "contato@contabilidade.com",
                          telefone: respTelefone || "(82) 99999-9999",
                          crc: respCrc,
                          estadoCrc: respEstadoCrc || "AL",
                          categoria: respCategoria,
                          situacao: respSituacao,
                          validadeCrc: respValidadeCrc,
                          principal: respPrincipal
                        };

                        if (respPrincipal) {
                          // Move existing principal to history log
                          const oldPrincipal = responsaveis.find(r => r.principal);
                          if (oldPrincipal) {
                            setHistoricoResponsaveis(prev => [
                              {
                                id: `hist-${Date.now()}`,
                                nomeAnterior: oldPrincipal.nome,
                                dataInicial: "15/08/2023",
                                dataFinal: new Date().toLocaleDateString("pt-BR"),
                                usuarioSubstituicao: "Admin Geral"
                              },
                              ...prev
                            ]);
                          }
                          // Set all others as false
                          setResponsaveis(prev => [
                            newResp,
                            ...prev.map(r => ({ ...r, principal: false }))
                          ]);
                        } else {
                          setResponsaveis(prev => [...prev, newResp]);
                        }

                        setShowAddResponsavelModal(false);
                        addToast(`Contador técnico ${respNome} adicionado!`, "success");
                      }}
                      className="flex-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md h-8 flex items-center justify-center select-none"
                    >
                      Adicionar Contador
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* MODAL: CONVIDAR MEMBRO DA EQUIPE */}
            {showInviteMemberModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="text-base font-extrabold text-zinc-900 uppercase tracking-tight font-display">Convidar Colaborador</h3>
                    <button onClick={() => setShowInviteMemberModal(false)} className="text-zinc-400 hover:text-zinc-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-zinc-700">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome Completo</label>
                      <input 
                        type="text" 
                        value={inviteNome} 
                        onChange={(e) => setInviteNome(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500 text-xs"
                        placeholder="Ex: Ana Clara Silva"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        value={inviteEmail} 
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500 text-xs"
                        placeholder="email@contabilidadealfa.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Cargo / Função</label>
                      <input 
                        type="text" 
                        value={inviteCargo} 
                        onChange={(e) => setInviteCargo(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500 text-xs"
                        placeholder="Ex: Assistente de Escrita Fiscal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Perfil de Acesso</label>
                      <select 
                        value={inviteAcesso} 
                        onChange={(e) => setInviteAcesso(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500 text-xs"
                      >
                        <option value="Administrador">Administrador (Acesso completo)</option>
                        <option value="Operador">Operador (Apenas rotinas fiscais)</option>
                        <option value="Auditor">Auditor (Apenas visualização)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <button 
                      onClick={() => setShowInviteMemberModal(false)}
                      className="flex-1 px-3.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-zinc-200 transition-all duration-200 cursor-pointer h-8 flex items-center justify-center select-none"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (!inviteNome || !inviteEmail) {
                          addToast("Preencha Nome e E-mail!", "error");
                          return;
                        }
                        setTeamMembers(prev => [
                          ...prev,
                          {
                            id: `tm-${Date.now()}`,
                            nome: inviteNome,
                            email: inviteEmail,
                            cargo: inviteCargo || "Assistente",
                            status: "Pendente",
                            acesso: inviteAcesso
                          }
                        ]);
                        setShowInviteMemberModal(false);
                        addToast(`Convite enviado com sucesso para ${inviteNome}!`, "success");
                      }}
                      className="flex-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md h-8 flex items-center justify-center select-none"
                    >
                      Enviar Convite
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ====================================================================
            VIEW: DASHBOARD (INÍCIO)
            ==================================================================== */}
        {currentPage === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >


            {/* Header: Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  <span className="text-zinc-600">Dashboard</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Visão Geral do Módulo</h2>
                <p className="text-sm text-zinc-500 mt-1">Acompanhe métricas, status de apurações e alertas pendentes do seu escritório.</p>
              </div>
              <div className="hidden md:block shrink-0">
                {renderUserDropdown()}
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  title: "Empresas Ativas", 
                  value: companies.filter(c => c.statusEmpresa === "Ativa" || !c.statusEmpresa).length.toString(), 
                  subtitle: "Em operação regular",
                  trend: "up",
                  trendText: "+2 novas no mês",
                  trendColor: "text-emerald-700 bg-emerald-100/50",
                  icon: Building, 
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100/50",
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Ativa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Suspensas", 
                  value: companies.filter(c => c.statusEmpresa === "Suspensa").length.toString(), 
                  subtitle: "Aguardando regularização",
                  trend: "neutral",
                  trendText: "0 alterações",
                  trendColor: "text-amber-700 bg-amber-100/50",
                  icon: AlertCircle, 
                  color: "text-amber-600 bg-amber-50 border-amber-100/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Suspensa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Inativas", 
                  value: companies.filter(c => c.statusEmpresa === "Inativa").length.toString(), 
                  subtitle: "Paralisadas temporariamente",
                  trend: "down",
                  trendText: "-1 neste mês",
                  trendColor: "text-zinc-600 bg-zinc-100",
                  icon: Lock, 
                  color: "text-zinc-600 bg-zinc-50 border-zinc-100/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Inativa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Excluídas", 
                  value: companies.filter(c => c.statusEmpresa === "Excluída").length.toString(), 
                  subtitle: "Registros arquivados",
                  trend: "neutral",
                  trendText: "Nenhuma recente",
                  trendColor: "text-rose-700 bg-rose-100/50",
                  icon: Trash2, 
                  color: "text-rose-600 bg-rose-50 border-rose-100/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Excluída");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={i} 
                    onClick={stat.action}
                    className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black text-zinc-900 font-display tracking-tighter">{stat.value}</p>
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl border shrink-0 transition-all duration-300 group-hover:scale-110 ${stat.color}`}>
                        <Icon className="h-5.5 w-5.5" strokeWidth={2} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100/80">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trendColor}`}>
                          {stat.trendText}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Arrow Icon top-right */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-zinc-400 translate-y-1 group-hover:translate-y-0 translate-x--1 group-hover:translate-x-0">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>                  </div>
                );
              })}
            </div>

            {/* Bento Grid Layout (Two columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Column 1: Monitoring / Recent Transmissions List */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 tracking-tight font-display uppercase">Monitor de Apurações Recentes</h3>
                    <p className="text-[11px] text-zinc-500 font-semibold">Acompanhe e controle individualmente as obrigações fiscais ativas.</p>
                  </div>
                  {/* Local Dashboard Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por cliente..."
                      value={dashboardSearch}
                      onChange={(e) => setDashboardSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-350 focus:bg-white text-xs font-semibold rounded-full outline-none transition-all placeholder:text-zinc-400 h-9"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <th className="py-3 px-2">Empresa</th>
                        <th className="py-3 px-2 hidden md:table-cell">Regime</th>
                        <th className="py-3 px-2">Sua Conexão</th>
                        <th className="py-3 px-2">PGDAS (06/2026)</th>
                        <th className="py-3 px-2 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100/70">
                      {companies
                        .filter(c => 
                          c.razaoSocial.toLowerCase().includes(dashboardSearch.toLowerCase()) || 
                          c.cnpj.includes(dashboardSearch)
                        )
                        .slice(0, 5)
                        .map((c) => {
                          const initial = c.razaoSocial.substring(0, 2).toUpperCase();
                          const colorHash = c.cnpj.replace(/\D/g, "");
                          const sum = Array.from(colorHash).reduce((acc, char) => acc + parseInt(char, 10), 0);
                          const colorSchemes = [
                            "bg-blue-50 text-blue-600 border-blue-100",
                            "bg-purple-50 text-purple-600 border-purple-100",
                            "bg-emerald-50 text-emerald-600 border-emerald-100",
                            "bg-orange-50 text-orange-600 border-orange-100",
                            "bg-rose-50 text-rose-600 border-rose-100"
                          ];
                          const colorClass = colorSchemes[sum % colorSchemes.length];

                          return (
                            <tr key={c.cnpj} className="group hover:bg-zinc-50/50 transition-colors">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  {c.logoUrl ? (
                                    <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-zinc-200 bg-zinc-50">
                                      <img src={c.logoUrl} alt={c.razaoSocial} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  ) : (
                                    <div className={`h-8 w-8 rounded-lg ${colorClass} flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-current/10 font-display`}>
                                      {initial}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-xs text-zinc-900 truncate max-w-[160px] md:max-w-xs font-display">{c.razaoSocial}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold tracking-tight">{c.cnpj}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2 hidden md:table-cell">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{c.regimeTributario}</span>
                              </td>
                              <td className="py-4 px-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  c.statusAcesso !== "Não Configurado" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${c.statusAcesso !== "Não Configurado" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                  {c.statusAcesso !== "Não Configurado" ? "Ativo" : "Pendente"}
                                </span>
                              </td>
                              <td className="py-4 px-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                                  c.statusPgdas === "Entregue"
                                    ? "bg-emerald-500 text-white"
                                    : c.statusPgdas === "Processando"
                                    ? "bg-blue-500 text-white animate-pulse"
                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                }`}>
                                  {c.statusPgdas}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedCompanyCnpj(c.cnpj);
                                    setPgdasEmpresaCnpj(c.cnpj);
                                    setPgdasEmpresaName(c.razaoSocial);
                                    setCurrentPage("pgdas");
                                    addToast(`Módulo fiscal da empresa "${c.razaoSocial}" selecionado com sucesso.`, "success");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] rounded-lg uppercase tracking-wider transition-all shadow-xs shrink-0 cursor-pointer"
                                >
                                  Gerenciar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => {
                      setFilterRegime("all");
                      setFilterAcesso("all");
                      setCurrentPage("empresas");
                    }}
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer select-none"
                  >
                    <span>Ver todas as {companies.length} empresas</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Column 2: Bento Deadlines & Alerts & Certificates Health */}
              <div className="lg:col-span-4 space-y-6">
                {/* Bento Card A: Próximos Vencimentos */}
                <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 tracking-tight font-display uppercase">Agenda Tributária</h3>
                    <p className="text-[11px] text-zinc-500 font-semibold">Fique atento aos principais prazos de entrega do mês.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        day: "20",
                        month: "JUL",
                        title: "PGDAS-D Competência Junho/2026",
                        desc: "Prazo final de entrega e pagamento do Simples Nacional",
                        urgency: "Urgente",
                        urgencyColor: "bg-rose-50 text-rose-600 border-rose-100"
                      },
                      {
                        day: "31",
                        month: "JUL",
                        title: "Renovação de Certificados",
                        desc: "Atualização cadastral de 3 empresas ativas",
                        urgency: "Alerta",
                        urgencyColor: "bg-amber-50 text-amber-600 border-amber-100"
                      },
                      {
                        day: "20",
                        month: "AGO",
                        title: "Início do Fechamento de Julho",
                        desc: "Coleta e verificação primária de notas de serviço tomadas",
                        urgency: "Planejado",
                        urgencyColor: "bg-zinc-50 text-zinc-500 border-zinc-100"
                      }
                    ].map((deadline, index) => (
                      <div key={index} className="flex gap-3 items-start p-3 hover:bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-100 transition-all">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex flex-col items-center justify-center font-display shrink-0 shadow-sm">
                          <span className="text-[13px] font-black leading-none">{deadline.day}</span>
                          <span className="text-[7px] font-black opacity-80 mt-0.5 tracking-wider">{deadline.month}</span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <h4 className="text-[11px] font-black text-zinc-900 tracking-tight truncate leading-none uppercase" title={deadline.title}>{deadline.title}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border shrink-0 ${deadline.urgencyColor}`}>
                              {deadline.urgency}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium leading-normal">{deadline.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bento Card B: Saúde dos Certificados Digitais */}
                <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-zinc-900 tracking-tight font-display uppercase">Certificados Digitais</h3>
                      <p className="text-[11px] text-zinc-500 font-semibold">Monitoramento em tempo real de expiração.</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* High fidelity progress visualizer */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>Certificados Saudáveis</span>
                        <span className="text-emerald-600 font-extrabold">100% Ativos</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-wide leading-none">Status Geral</p>
                        <p className="text-[11px] text-zinc-500 font-bold">Nenhum certificado expirado ou revogado.</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </div>

                    <button
                      onClick={() => setCurrentPage("certificados")}
                      className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-black text-[9px] rounded-lg uppercase tracking-widest transition-all cursor-pointer text-center"
                    >
                      Gerenciar Certificados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====================================================================
            VIEW: DETALHES EMPRESA
            ==================================================================== */}
        {currentPage === "detalhes_empresa" && selectedCompanyForDetails && (
          <motion.div
            key="detalhes_empresa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-20 relative"
          >
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <button onClick={() => setCurrentPage("empresas")} className="hover:text-emerald-600 transition-colors cursor-pointer">Empresas</button>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Detalhes do Cliente</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                  {selectedCompanyForDetails.razaoSocial}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                    selectedCompanyForDetails.statusEmpresa === "Ativa" || !selectedCompanyForDetails.statusEmpresa
                      ? "bg-emerald-50 text-emerald-600"
                      : selectedCompanyForDetails.statusEmpresa === "Suspensa"
                      ? "bg-amber-50 text-amber-600"
                      : selectedCompanyForDetails.statusEmpresa === "Inativa"
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-rose-50 text-rose-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedCompanyForDetails.statusEmpresa === "Ativa" || !selectedCompanyForDetails.statusEmpresa
                        ? "bg-emerald-500"
                        : selectedCompanyForDetails.statusEmpresa === "Suspensa"
                        ? "bg-amber-500"
                        : selectedCompanyForDetails.statusEmpresa === "Inativa"
                        ? "bg-zinc-400"
                        : "bg-rose-500"
                    }`}></span>
                    {selectedCompanyForDetails.statusEmpresa || "Ativa"}
                  </span>
                  <div className="w-[1px] h-3 bg-zinc-300" />
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">CNPJ: <span className="text-zinc-800">{selectedCompanyForDetails.cnpj}</span></p>
                  <div className="w-[1px] h-3 bg-zinc-300" />
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Regime: <span className="text-zinc-800">{selectedCompanyForDetails.regimeTributario}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => {
                    editCompany(selectedCompanyForDetails);
                  }}
                  className="flex-1 md:flex-none px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider h-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar Cadastro
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Esquerda: Informações Principais */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                    <Building className="h-4 w-4 text-emerald-600" /> Dados Cadastrais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome Fantasia</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.nomeFantasia}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Localidade</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.municipio} - {selectedCompanyForDetails.uf}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Anexo da Empresa</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.tratamentoTributarioGlobal || "AUTOMATICO SISTEMA"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Última Apuração</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.periodoApuracao}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                    <Layers className="h-4 w-4 text-emerald-600" /> Obrigações e Apurações Recentes
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { comp: "06/2026", status: "Entregue", data: "15/07/2026", imposto: "R$ 4.250,00" },
                      { comp: "05/2026", status: "Entregue", data: "14/06/2026", imposto: "R$ 3.890,50" },
                      { comp: "04/2026", status: "Entregue", data: "12/05/2026", imposto: "R$ 4.100,20" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">Competência {item.comp}</p>
                            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Entregue em {item.data}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-zinc-900">{item.imposto}</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Simples Nacional (DAS)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direita: Status e Ações */}
              <div className="space-y-6">
                <div className="bg-zinc-900 p-6 rounded-3xl shadow-sm text-white">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Conexão e Certificado
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status da Conexão</p>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full animate-pulse ${selectedCompanyForDetails.statusAcesso === "Não Configurado" ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <p className="text-sm font-bold text-white">{selectedCompanyForDetails.statusAcesso}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCompanyCnpj(selectedCompanyForDetails.cnpj);
                        if (selectedCompanyForDetails.statusAcesso !== "Não Configurado") {
                          setMetodoAcesso(selectedCompanyForDetails.statusAcesso === "e-CNPJ Ativo" ? "certificado" : "procuracao");
                        }
                        setCurrentPage("certificados");
                      }}
                      className="w-full py-2.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" /> 
                      {selectedCompanyForDetails.statusAcesso === "Não Configurado" ? "Configurar Acesso" : "Gerenciar Acesso"}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Layers className="h-4 w-4 text-emerald-600" /> Ações Rápidas
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setPgdasEmpresaName(selectedCompanyForDetails.razaoSocial);
                        setPgdasEmpresaCnpj(selectedCompanyForDetails.cnpj);
                        setCurrentPage("pgdas");
                      }}
                      className="p-3 bg-zinc-50 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-emerald-700 transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-lg group-hover:bg-emerald-100 transition-colors shadow-xs">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-center leading-tight">Apurar<br/>PGDAS</span>
                    </button>
                    <button 
                      className="p-3 bg-zinc-50 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-emerald-700 transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-lg group-hover:bg-emerald-100 transition-colors shadow-xs">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-center leading-tight">Emitir<br/>DAS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====================================================================
            VIEW: EMPRESAS (LISTA DE CLIENTES)
            ==================================================================== */}
        {currentPage === "empresas" && (
          <motion.div
            key="empresas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  <span>Gestão de Clientes</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Empresas</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Empresas</h2>
                <p className="text-sm text-zinc-500 mt-1">Gerencie a lista de empresas atendidas, status de documentos e parametrizações.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={createNewCompany}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-[10px] font-black shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-8 uppercase tracking-wider select-none"
                  id="btn-nova-empresa-top"
                >
                  Nova Empresa
                </button>
                <div className="hidden md:block">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* Beautiful Interactive List of Active Clients in Dashboard */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                {/* Search and Filters */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar por razão social ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCompaniesPage(1); }}
                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white text-[13px] font-medium rounded-full outline-none transition-all placeholder:text-zinc-400 h-11"
                  />
                </div>
                <div className="flex w-full md:w-auto gap-3 flex-wrap lg:flex-nowrap">
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterRegime}
                      onChange={(e) => { setFilterRegime(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Regime: Todos</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterAcesso}
                      onChange={(e) => { setFilterAcesso(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Conexão: Todas</option>
                      <option value="Configurado">Configurado</option>
                      <option value="Não Configurado">Não Configurado</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Status: Todos</option>
                      <option value="Ativa">Ativa</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Excluída">Excluída</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterPgdas}
                      onChange={(e) => { setFilterPgdas(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">PGDAS: Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Processando">Processando</option>
                      <option value="Sem Movimento">Sem Movimento</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-zinc-400 font-extrabold uppercase tracking-widest text-[10px] border-b border-zinc-100">
                      <th className="pb-4 px-2 font-display">Empresa / CNPJ</th>
                      <th className="pb-4 px-2 font-display">Regime / Localidade</th>
                      <th className="pb-4 px-2 font-display">Apuração PGDAS-D</th>
                      <th className="pb-4 px-2 font-display">Status da Empresa</th>
                      <th className="pb-4 text-right px-2 font-display">Ação</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    className="divide-y divide-zinc-50/80 font-medium text-zinc-700"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={`${companiesPage}-${searchTerm}-${filterRegime}-${filterAcesso}-${filterStatus}-${filterPgdas}`}
                  >
                    {isLoadingCompanies ? (
                      Array.from({ length: Math.min(companiesPerPage, 5) }).map((_, idx) => (
                        <motion.tr key={idx} variants={itemVariants} className="animate-pulse">
                          <td className="py-5 px-2">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-zinc-100 shrink-0" />
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="h-4 bg-zinc-100 rounded w-48 sm:w-64" />
                                <div className="h-3 bg-zinc-50 rounded w-32" />
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-2">
                            <div className="space-y-2">
                              <div className="h-4 bg-zinc-100 rounded w-28" />
                              <div className="h-3 bg-zinc-50 rounded w-20" />
                            </div>
                          </td>
                          <td className="py-5 px-2">
                            <div className="h-6 bg-zinc-100 rounded-full w-24" />
                          </td>
                          <td className="py-5 px-2">
                            <div className="h-6 bg-zinc-100 rounded-full w-16" />
                          </td>
                          <td className="py-5 px-2 text-right">
                            <div className="h-8 bg-zinc-100 rounded-lg w-20 ml-auto" />
                          </td>
                        </motion.tr>
                      ))
                    ) : paginatedCompanies.length === 0 ? (
                      <motion.tr variants={itemVariants}>
                        <td colSpan={5} className="py-16 text-center">
                          <Building className="h-10 w-10 text-zinc-200 mx-auto mb-3" strokeWidth={1} />
                          <p className="text-zinc-400 text-sm font-bold">Nenhuma empresa encontrada com os filtros selecionados.</p>
                          <button 
                            onClick={() => { setSearchTerm(""); setFilterRegime("all"); setFilterAcesso("all"); }}
                            className="mt-4 text-emerald-600 hover:text-emerald-700 text-[12px] font-extrabold underline cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        </td>
                      </motion.tr>
                    ) : (
                      paginatedCompanies.map((company, idx) => {
                        const initial = company.razaoSocial.substring(0, 2).toUpperCase();
                        // Cycle through some nice colors for the initials
                        const bgColors = ["bg-emerald-50 text-emerald-600", "bg-blue-50 text-blue-600", "bg-teal-50 text-teal-600", "bg-indigo-50 text-indigo-600", "bg-cyan-50 text-cyan-600"];
                        const colorClass = bgColors[idx % bgColors.length];
                        
                        return (
                          <motion.tr 
                            key={company.cnpj} 
                            variants={itemVariants}
                            className="hover:bg-zinc-50/40 transition-colors duration-150"
                          >
                            <td className="py-5 px-2">
                              <div className="flex items-center gap-4">
                                {company.logoUrl ? (
                                  <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                                    <img src={company.logoUrl} alt={company.razaoSocial} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                ) : (
                                  <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center font-extrabold text-[13px] shrink-0 border border-current/10 font-display`}>
                                    {initial}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[13px] text-zinc-900 tracking-tight truncate max-w-[200px] sm:max-w-md font-display" title={company.razaoSocial}>
                                    {highlightText(company.razaoSocial, searchTerm)}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                                    CNPJ: {highlightCnpj(company.cnpj, searchTerm)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-2">
                              <p className="text-zinc-900 font-extrabold text-[13px] tracking-tight font-display">{company.regimeTributario}</p>
                              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">{company.municipio} - {company.uf}</p>
                            </td>
                            <td className="py-5 px-2">
                              <div className="flex flex-col gap-1">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-extrabold w-fit">
                                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                                  Em andamento
                                </div>
                                <span className="text-[11px] text-zinc-400 font-bold ml-1">Importação fiscal</span>
                              </div>
                            </td>
                            <td className="py-5 px-2">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold w-fit">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Ativo
                              </div>
                            </td>
                            <td className="py-5 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedCompanyForDetails(company);
                                    setCurrentPage("detalhes_empresa");
                                  }}
                                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition-all cursor-pointer"
                                  title="Ver detalhes da empresa"
                                >
                                  Detalhes
                                </button>
                                <button
                                  onClick={() => editCompany(company)}
                                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg text-[10px] font-extrabold shadow-2xs transition-all cursor-pointer flex items-center gap-1 select-none"
                                  title="Editar cadastro da empresa"
                                >
                                  <Pencil className="h-3 w-3 text-zinc-400" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCompanyCnpj(company.cnpj);
                                    if (company.statusAcesso !== "Não Configurado") {
                                      setMetodoAcesso(company.statusAcesso === "e-CNPJ Ativo" ? "certificado" : "procuracao");
                                    }
                                    setCurrentPage("certificados");
                                    addToast(`Configurando acesso fiscal para ${company.razaoSocial}`, "info");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition-all cursor-pointer"
                                >
                                  Gerenciar
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </motion.tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalCompaniesItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 text-xs font-bold text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span>Mostrando</span>
                    <span className="text-zinc-800">{startCompanyIndex + 1}</span>
                    <span>a</span>
                    <span className="text-zinc-800">{Math.min(startCompanyIndex + companiesPerPage, totalCompaniesItems)}</span>
                    <span>de</span>
                    <span className="text-zinc-800">{totalCompaniesItems}</span>
                    <span>empresas</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-405 font-semibold uppercase tracking-wider">Exibir:</span>
                      <select
                        value={companiesPerPage}
                        onChange={(e) => {
                          setCompaniesPerPage(Number(e.target.value));
                          setCompaniesPage(1);
                        }}
                        className="px-2 py-1 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 rounded-lg outline-none cursor-pointer text-zinc-700 text-xs font-bold h-7"
                      >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>

                    {/* Page buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCompaniesPage(prev => Math.max(prev - 1, 1))}
                        disabled={activeCompaniesPage === 1}
                        className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Página Anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalCompaniesPages }, (_, i) => i + 1).map((pageNum) => {
                        // Always show if total pages is small
                        if (totalCompaniesPages <= 7) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCompaniesPage(pageNum)}
                              className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeCompaniesPage === pageNum
                                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/15"
                                  : "hover:bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-transparent"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }

                        const isFirstOrLast = pageNum === 1 || pageNum === totalCompaniesPages;
                        const isNearActive = Math.abs(pageNum - activeCompaniesPage) <= 1;

                        if (!isFirstOrLast && !isNearActive) {
                          if (pageNum === 2 || pageNum === totalCompaniesPages - 1) {
                            return <span key={pageNum} className="px-1 text-zinc-350">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCompaniesPage(pageNum)}
                            className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              activeCompaniesPage === pageNum
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/15"
                                : "hover:bg-zinc-100 text-zinc-650 hover:text-zinc-900 border border-transparent"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCompaniesPage(prev => Math.min(prev + 1, totalCompaniesPages))}
                        disabled={activeCompaniesPage === totalCompaniesPages}
                        className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Próxima Página"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
        {/* ====================================================================
            VIEW: CERTIFICADO E PROCURAÇÃO (CERTIFICADOS)
            ==================================================================== */}
        {currentPage === "certificados" && (
          <motion.div
            key="certificados"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            id="screen-certificado"
          >
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  <span>Módulo fiscal</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Certificado</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Certificado e Procuração</h2>
                <p className="text-sm text-zinc-500 mt-1">Defina o certificado ou a procuração usados pelos serviços fiscais da empresa.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs uppercase tracking-wider select-none h-10 w-full sm:w-auto"
                >
                  Voltar
                </button>
                <button
                  onClick={saveCertificateConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider select-none h-10 w-full sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Salvar configuração
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* Active Company Bar */}
            {(() => {
              const activeCompany = companies.find(c => c.cnpj === selectedCompanyCnpj) || companies[0];
              const maskedCnpj = activeCompany?.cnpj ? activeCompany.cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/, "$1.***.***/****-$5") : "66.***.***/****-34";
              const rawCnpj = activeCompany?.cnpj ? "cnpj-" + activeCompany.cnpj.replace(/\D/g, "") : "cnpj-66378843000134";

              return (
                <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                  
                  <div className="flex items-start md:items-center gap-5 flex-1 pl-2">
                    {activeCompany?.logoUrl ? (
                      <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 bg-zinc-50 shadow-xs flex items-center justify-center">
                        <img src={activeCompany.logoUrl} alt={activeCompany.razaoSocial} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border border-zinc-200 bg-zinc-50/60 flex items-center justify-center text-zinc-400 shrink-0 shadow-xs">
                        <Building className="h-7 w-7 text-zinc-400" />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Empresa Selecionada</p>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 stroke-[2.5]" /> Ativa
                        </span>
                      </div>
                      
                      <div className="relative max-w-md mt-1 group">
                        <select
                          value={selectedCompanyCnpj}
                          onChange={(e) => {
                            const newCnpj = e.target.value;
                            setSelectedCompanyCnpj(newCnpj);
                            setUploadedFile(null);
                            setSenhaCertificado("");
                            setIsValidatedCert(false);
                          }}
                          className="w-full h-11 pl-3.5 pr-11 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-base font-black text-zinc-800 bg-zinc-50/30 hover:bg-white transition-all outline-none appearance-none cursor-pointer tracking-tight shadow-2xs"
                        >
                          {companies.map((c) => (
                            <option key={c.cnpj} value={c.cnpj}>
                              {c.razaoSocial}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold mt-1 flex-wrap">
                        <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 font-bold">{maskedCnpj}</span>
                        <span>·</span>
                        <span className="text-zinc-600 font-bold">{activeCompany?.regimeTributario || "Simples Nacional"}</span>
                        <span>·</span>
                        <span className="text-zinc-600 font-bold">{activeCompany?.municipio || "Belo Horizonte"} - {activeCompany?.uf || "MG"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 md:gap-12 lg:self-center bg-zinc-50/50 p-4 md:p-5 rounded-2xl border border-zinc-100 shrink-0">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ID Identificador</p>
                      <p className="text-xs font-bold text-zinc-700 font-mono tracking-wider">{rawCnpj}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-zinc-200" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Automação de Apuração</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${activeCompany?.statusAcesso !== "Não Configurado" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                        <p className={`text-xs font-extrabold ${activeCompany?.statusAcesso !== "Não Configurado" ? "text-emerald-700" : "text-amber-700"}`}>
                          {activeCompany?.statusAcesso !== "Não Configurado" ? "Canal Integrado" : "Pendente de Vínculo"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECTION 1: Método de acesso fiscal */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Passo 1</h4>
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Defina o Método de Acesso Fiscal</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Certificado da empresa */}
                <div 
                  onClick={() => setMetodoAcesso("certificado")}
                  className={`p-6 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    metodoAcesso === "certificado" 
                      ? "bg-emerald-50/20 border-emerald-500 text-emerald-900 shadow-sm" 
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xs text-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      metodoAcesso === "certificado" ? "bg-emerald-500 text-white shadow-sm" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                    }`}>
                      <FileKey className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900">Certificado Digital e-CNPJ da Empresa</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-semibold">Envie o arquivo A1 (.pfx/.p12) exclusivo da própria empresa.</p>
                    </div>
                  </div>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    metodoAcesso === "certificado" 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "border-zinc-200 group-hover:border-zinc-300 bg-white"
                  }`}>
                    {metodoAcesso === "certificado" ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-transparent group-hover:bg-zinc-100" />
                    )}
                  </div>
                </div>

                {/* Procuração para o escritório */}
                <div 
                  onClick={() => setMetodoAcesso("procuracao")}
                  className={`p-6 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    metodoAcesso === "procuracao" 
                      ? "bg-emerald-50/20 border-emerald-500 text-emerald-900 shadow-sm" 
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xs text-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      metodoAcesso === "procuracao" ? "bg-emerald-500 text-white shadow-sm" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                    }`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900">Procuração Eletrônica RFB (e-CAC)</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-semibold">O escritório opera utilizando a procuração vinculada ao e-CNPJ contábil.</p>
                    </div>
                  </div>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    metodoAcesso === "procuracao" 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "border-zinc-200 group-hover:border-zinc-300 bg-white"
                  }`}>
                    {metodoAcesso === "procuracao" ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-transparent group-hover:bg-zinc-100" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Configuração por Certificado Digital */}
            {metodoAcesso === "certificado" ? (
              <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                      <FileKey className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Passo 2</h4>
                      <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Upload do Certificado Digital (A1)</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full shrink-0">
                    <Lock className="h-3 w-3 text-emerald-600" />
                    <span>Conexão criptografada SSL</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Interactive Upload Box */}
                  <div className="lg:col-span-5 space-y-3">
                    <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Arquivo do certificado (.pfx ou .p12)</label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3.5 cursor-pointer transition-all duration-300 min-h-[190px] ${
                        uploadedFile 
                          ? "bg-emerald-50/5 border-emerald-500/60 text-emerald-800" 
                          : "border-zinc-200 hover:border-emerald-500/40 bg-zinc-50/30 hover:bg-white text-zinc-500 hover:shadow-xs"
                      }`}
                    >
                      {uploadedFile ? (
                        <div className="flex flex-col items-center gap-2.5">
                          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-2xs relative">
                            <FileText className="h-8 w-8" />
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5">
                              <Check className="h-3 w-3 stroke-[3px]" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-800 truncate max-w-[220px]">{uploadedFile.name}</p>
                            <p className="text-[10px] text-zinc-500 font-extrabold mt-0.5 uppercase tracking-wider">
                              Tamanho: {uploadedFile.size} · Carregado
                            </p>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                              setIsValidatedCert(false);
                            }}
                            className="mt-1 text-[10px] font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-2.5 py-1 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remover arquivo
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-3.5 bg-zinc-100 text-zinc-400 rounded-2xl transition-colors">
                            <Upload className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-800">Arraste o arquivo ou clique para carregar</p>
                            <p className="text-[10px] text-zinc-400 font-bold mt-1 max-w-[220px] mx-auto leading-relaxed">
                              Selecione arquivos e-CNPJ tipo A1 formatados em <span className="font-mono text-zinc-600 font-extrabold">.pfx</span> ou <span className="font-mono text-zinc-600 font-extrabold">.p12</span> (máximo 10MB)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      accept=".pfx,.p12" 
                      className="hidden" 
                    />
                  </div>

                  {/* Right Column: Parameters and Actions */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Senha do certificado *</label>
                        <div className="relative">
                          <input 
                            type={mostrarSenha ? "text" : "password"} 
                            placeholder="Senha para chaves privadas"
                            value={senhaCertificado}
                            onChange={(e) => setSenhaCertificado(e.target.value)}
                            className="w-full h-11 px-3.5 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-xs font-bold bg-white text-zinc-800 outline-none shadow-2xs transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            {mostrarSenha ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <LockKeyhole className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Responsável pela Configuração *</label>
                        <div className="relative">
                          <select 
                            value={responsavelConfig} 
                            onChange={(e) => setResponsavelConfig(e.target.value)}
                            className="w-full h-11 pl-3.5 pr-10 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-xs font-bold bg-white text-zinc-800 outline-none appearance-none shadow-2xs transition-all cursor-pointer"
                          >
                            <option value="">Selecione o operador</option>
                            <option value="Naiale Augustinho">Naiale Augustinha</option>
                            <option value="Carlos Alberto">Carlos Alberto</option>
                            <option value="Mariana Silva">Mariana Silva</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Validade Identificada</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={isValidatedCert ? certExpiryDate : "Aguardando validação"} 
                            disabled 
                            className={`w-full h-11 pl-3.5 pr-10 border rounded-2xl text-xs font-bold outline-none shadow-2xs ${
                              isValidatedCert 
                                ? "border-emerald-200 bg-emerald-50/20 text-emerald-700" 
                                : "border-zinc-200 bg-zinc-50/70 text-zinc-400"
                            }`}
                          />
                          <Calendar className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isValidatedCert ? "text-emerald-500" : "text-zinc-400"}`} />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">CNPJ Titular Esperado</label>
                        {(() => {
                          const activeCompany = companies.find(c => c.cnpj === selectedCompanyCnpj) || companies[0];
                          const maskedCnpj = activeCompany?.cnpj ? activeCompany.cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/, "$1.***.***/****-$5") : "66.***.***/****-34";
                          return (
                            <input 
                              type="text" 
                              value={maskedCnpj} 
                              disabled 
                              className="w-full h-11 px-3.5 border border-zinc-200 bg-zinc-50/70 text-zinc-500 rounded-2xl text-xs font-bold font-mono shadow-2xs"
                            />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Progress with beautiful anims */}
                    {isValidatingCert && (
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                        <div className="flex justify-between items-center text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                            <span>{validationProgressMessage || "Processando..."}</span>
                          </div>
                          <span className="font-mono">{certValidationProgress}%</span>
                        </div>
                        <div className="w-full bg-emerald-100/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${certValidationProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Verification & Action buttons inside panel */}
                    <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
                      <button 
                        onClick={validateCertificate}
                        disabled={isValidatingCert}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 active:scale-95 border border-zinc-200 rounded-xl text-zinc-700 font-extrabold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs uppercase tracking-wider h-10 select-none disabled:opacity-50"
                      >
                        {isValidatingCert ? (
                          <RefreshCw className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        )}
                        {isValidatingCert ? "Validando Chaves..." : "Validar Chaves"}
                      </button>
                      <button 
                        onClick={saveCertificateConfig}
                        disabled={isValidatingCert || !isValidatedCert}
                        className={`px-5 py-2 rounded-xl font-extrabold text-[11px] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 h-10 uppercase tracking-wider select-none ${
                          isValidatedCert 
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                        }`}
                      >
                        <Save className="h-4 w-4" />
                        Salvar Certificado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If procuracao selected instead */
              <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Passo 2</h4>
                      <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Habilitação via Procuração Eletrônica</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full shrink-0">
                    <Info className="h-3 w-3 text-emerald-600" />
                    <span>Dispensa envio de arquivo local</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Guiding instruction list */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Como vincular a procuração do escritório no e-CAC?</h5>
                      
                      <div className="space-y-3.5">
                        {[
                          { step: "Acesse o portal e-CAC da Receita Federal", desc: "Acesse ecac.receitafederal.gov.br utilizando a conta gov.br do cliente corporativo." },
                          { step: "Cadastre Procuração para o CNPJ do Escritório", desc: "Selecione a opção 'Procuração Contábil' e informe o CNPJ do nosso escritório registrado." },
                          { step: "Habilite as opções fiscais do Simples Nacional", desc: "Garanta que as permissões de 'PGDAS-D e DEFIS' e 'Consulta Cobrança' estejam integralmente habilitadas." },
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-zinc-800">{item.step}</p>
                              <p className="text-[11px] text-zinc-500 font-semibold mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Reference Fields */}
                  <div className="lg:col-span-5 space-y-4 bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl">
                    <div className="space-y-3.5">
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Responsável pela Validação *</label>
                        <div className="relative">
                          <select 
                            value={responsavelConfig} 
                            onChange={(e) => setResponsavelConfig(e.target.value)}
                            className="w-full h-10 pl-3.5 pr-10 border border-zinc-200 rounded-xl text-xs font-bold bg-white text-zinc-800 outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="">Selecione o operador</option>
                            <option value="Naiale Augustinho">Naiale Augustinha</option>
                            <option value="Carlos Alberto">Carlos Alberto</option>
                            <option value="Mariana Silva">Mariana Silva</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Número do Processo de Vínculo (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 10380.720183/2026-90"
                          className="w-full h-10 px-3.5 border border-zinc-200 rounded-xl text-xs font-bold bg-white text-zinc-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      </div>

                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-3">
                        <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-emerald-800 font-semibold leading-relaxed">
                          Ao salvar, o sistema executará um rastreamento automático de procuração em lote na Receita Federal para validar se o vínculo contábil já consta como ativo.
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={saveCertificateConfig}
                          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider select-none h-10"
                        >
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          Confirmar Vínculo de Procuração
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Alertas de vencimento */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Passo 3</h4>
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Alertas de Vencimento de Acesso</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Part: Checkboxes & Email configs */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Checkboxes */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Frequência de Notificação</span>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-xs font-bold text-zinc-700 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={alerta30d} 
                            onChange={(e) => setAlerta30d(e.target.checked)} 
                            className="peer h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="group-hover:text-zinc-900 transition-colors">30 dias antes</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs font-bold text-zinc-700 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={alerta15d} 
                            onChange={(e) => setAlerta15d(e.target.checked)} 
                            className="peer h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="group-hover:text-zinc-900 transition-colors">15 dias antes</span>
                      </label>
                      <label className="flex items-center gap-3 text-xs font-bold text-zinc-700 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={alerta7d} 
                            onChange={(e) => setAlerta7d(e.target.checked)} 
                            className="peer h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="group-hover:text-zinc-900 transition-colors">7 dias antes</span>
                      </label>
                    </div>
                  </div>

                  {/* Alerta dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Direcionar Avisos Para</label>
                    <div className="relative">
                      <select 
                        value={enviarAlertaPara} 
                        onChange={(e) => setEnviarAlertaPara(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-xs font-bold bg-white text-zinc-800 outline-none appearance-none shadow-2xs transition-all cursor-pointer"
                      >
                        <option value="Responsável fiscal">Responsável Fiscal</option>
                        <option value="Financeiro">Departamento Financeiro</option>
                        <option value="Administrador">Administrador Geral</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">E-mail Adicional para Cópia</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={emailAdicional} 
                        onChange={(e) => setEmailAdicional(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-xs font-bold bg-white text-zinc-800 outline-none shadow-2xs transition-all"
                        placeholder="financeiro@empresa.com.br"
                      />
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Right Part: Emerald banner card */}
                <div className="lg:col-span-4 h-full">
                  <div className="bg-emerald-50/30 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4 h-full">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                      <Bell className="h-5 w-5 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Cronograma de Alertas</h5>
                      <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed mt-1">
                        Os e-mails serão gerados e encaminhados de forma programada com base nos prazos indicados. A ausência de chaves ativas interromperá o cálculo automático.
                      </p>
                      {isValidatedCert && (
                        <div className="mt-3 bg-white border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-max">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-emerald-800 font-extrabold uppercase">Próximo Aviso: {certExpiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ====================================================================
            VIEW: PGDAS-D
            ==================================================================== */}
        {currentPage === "pgdas" && (
          <motion.div
            key="pgdas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-20 relative"
            id="screen-pgdas"
          >
            {/* Header Navigation - Integra Contador */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-display">Integra Contador: PGDAS-D</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Integração Direta Serpro API</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setCurrentPage("dashboard"); }}
                  className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-extrabold transition-all shadow-xs select-none"
                >
                  Voltar ao Dashboard
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              {/* Painel Esquerdo: Parâmetros */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="h-4 w-4 text-emerald-600" /> Parâmetros da Requisição
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">CNPJ da Empresa</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs mt-1 bg-zinc-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" 
                        value={pgdasEmpresaCnpj}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Competência (MM/AAAA)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs mt-1 bg-zinc-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" 
                        value={pgdasCompetencia}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
                    <button 
                      onClick={() => addToast("Consultando PGDAS-D na API Serpro...", "info")}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Search className="h-3.5 w-3.5" /> Consultar Declaração
                    </button>
                    <button 
                      onClick={() => addToast("Transmitindo PGDAS-D via API Serpro...", "success")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Send className="h-3.5 w-3.5" /> Transmitir Declaração
                    </button>
                  </div>
                </div>
              </div>

              {/* Painel Direito: Resultados e Downloads */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm min-h-[300px]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-3 mb-4">
                    <Globe className="h-4 w-4 text-emerald-600" /> Resposta da API Serpro
                  </h3>
                  
                  <div className="bg-zinc-900 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                    <p className="text-zinc-500 mb-2">{/* Última consulta realizada com sucesso */}</p>
                    <pre>
{JSON.stringify({
  "status": "SUCESSO",
  "mensagem": "Declaração PGDAS-D recuperada com sucesso.",
  "dados": {
    "cnpj": pgdasEmpresaCnpj,
    "competencia": pgdasCompetencia,
    "receitaBruta": 178800.00,
    "valorDevido": pgdasPreviewInterna?.dasCalculado || 15400.00,
    "numeroRecibo": "NAO_TRANSMITIDO"
  }
}, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button 
                      onClick={() => addToast("Gerando DAS via API Serpro...", "info")}
                      className="px-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FileText className="h-6 w-6 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">Gerar Guia DAS</span>
                    </button>
                    <button 
                      onClick={() => addToast("Gerando Recibo via API Serpro...", "info")}
                      className="px-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">Obter Recibo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {currentPage === "cadastro_empresa" && (
          <motion.div
            key="cadastro_empresa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
            id="screen-cadastro-empresa"
          >
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5 mb-8">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <span>Empresas</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">{isEditingCompany ? "Edição" : "Cadastro"}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                  {isEditingCompany ? "Editar Empresa" : "Cadastro de Empresa"}
                </h2>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {isEditingCompany 
                    ? "Atualize os dados cadastrais essenciais e parâmetros fiscais do cliente." 
                    : "Registre os dados cadastrais essenciais e fiscais do cliente na plataforma."}
                </p>
              </div>
 
              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentPage("empresas")}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 border border-zinc-200 rounded-lg text-zinc-700 font-black text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer text-center h-8 flex items-center justify-center select-none"
                  id="btn-cancelar-cad"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCompanyConfig}
                  disabled={isSavingCompany || isSaveSuccess}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 h-8 cursor-pointer disabled:cursor-not-allowed ${
                    isSaveSuccess
                      ? "bg-emerald-500 text-white hover:bg-emerald-500 border-transparent"
                      : isSavingCompany
                      ? "bg-zinc-100 border border-zinc-200 text-zinc-400 shadow-none cursor-wait animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border-transparent hover:shadow-md"
                  }`}
                  id="btn-salvar-empresa-top"
                >
                  {isSavingCompany ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </motion.div>
                      <span>Salvando...</span>
                    </div>
                  ) : isSaveSuccess ? (
                    <motion.div 
                      className="flex items-center gap-1.5"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        initial={{ rotate: -180, scale: 0.6 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 14 }}
                        className="shrink-0"
                      >
                        <Check className="h-4 w-4 stroke-[3px]" />
                      </motion.div>
                      <span>Salvo com sucesso!</span>
                    </motion.div>
                  ) : (
                    <span>{isEditingCompany ? "Salvar Alterações" : "Salvar Empresa"}</span>
                  )}
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* STEP 1: Identificação */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">1</span>
                Identificação e Registro Cadastral
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Logo Upload Component */}
                <div className="md:col-span-12 flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100/80 mb-2">
                  <div className="relative shrink-0 group">
                    <div className="h-24 w-24 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/5 transition-all flex flex-col items-center justify-center overflow-hidden relative">
                      {companyLogoUrl ? (
                        <img 
                          src={companyLogoUrl} 
                          alt="Logo Preview" 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <Building className="h-7 w-7 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase group-hover:text-emerald-600 transition-colors">Sem Logo</span>
                        </div>
                      )}
                    </div>
                    {companyLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setCompanyLogoUrl(null)}
                        className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remover logotipo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <h5 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Logotipo da Empresa</h5>
                    <p className="text-[11px] text-zinc-500 font-medium max-w-xl leading-relaxed">
                      Adicione uma logomarca para personalizar relatórios, faturas e guias de PGDAS geradas para este cliente. Formatos recomendados: PNG, JPG ou SVG (Max 2MB).
                    </p>
                    <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("input-logo-file");
                          el?.click();
                        }}
                        className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 rounded-lg text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider border border-emerald-200/50"
                      >
                        {companyLogoUrl ? "Alterar Imagem" : "Selecionar Logotipo"}
                      </button>
                      {companyLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setCompanyLogoUrl(null)}
                          className="px-4 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider border border-zinc-200"
                        >
                          Remover
                        </button>
                      )}
                      <input 
                        type="file" 
                        id="input-logo-file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              addToast("Arquivo muito grande. O limite máximo é de 2MB.", "error");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setCompanyLogoUrl(event.target.result as string);
                                addToast("Logotipo carregado com sucesso!", "success");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* CNPJ with Lookup button */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    CNPJ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cnpj}
                      onChange={handleCnpjChange}
                      placeholder="00.000.000/0000-00"
                      className={`w-full pl-3 pr-11 py-2 border text-xs font-medium transition-all rounded-lg focus:outline-none focus:ring-2 ${
                        isCnpjValid
                          ? "border-emerald-500 bg-emerald-50/10 focus:ring-emerald-500/15 focus:border-emerald-600 text-emerald-900"
                          : isCnpjInvalidFormat
                          ? "border-rose-400 bg-rose-50/10 focus:ring-rose-500/15 focus:border-rose-500 text-rose-900"
                          : isCnpjIncomplete
                          ? "border-amber-400 bg-amber-50/10 focus:ring-amber-500/15 focus:border-amber-500 text-amber-900"
                          : "border-zinc-200 bg-white placeholder-zinc-400 text-zinc-800 focus:ring-emerald-500/15 focus:border-emerald-600"
                      }`}
                      id="input-cnpj-cad"
                    />
                    <button
                      type="button"
                      onClick={searchCnpj}
                      disabled={isSearchingCnpj || isCnpjIncomplete}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer ${
                        isSearchingCnpj
                          ? "bg-zinc-100 text-zinc-400 cursor-wait"
                          : isCnpjValid
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10"
                          : isCnpjInvalidFormat
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/10"
                          : isCnpjIncomplete
                          ? "bg-zinc-50 text-zinc-350 border border-zinc-100 cursor-not-allowed"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      }`}
                      id="btn-consultar-cnpj"
                      title={
                        isCnpjIncomplete
                          ? "Preencha o CNPJ completo"
                          : isCnpjInvalidFormat
                          ? "Dígitos verificadores incorretos. Clique para simular busca mesmo assim."
                          : "Consultar na Receita"
                      }
                    >
                      {isSearchingCnpj ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Search className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {isCnpjValid && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <Check className="h-3 w-3 stroke-[2.5]" /> CNPJ válido para consulta
                    </p>
                  )}
                  {isCnpjIncomplete && (
                    <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" /> CNPJ incompleto (digite 14 números)
                    </p>
                  )}
                  {isCnpjInvalidFormat && (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" /> CNPJ inválido (formato ou dígitos verificadores incorretos)
                    </p>
                  )}
                </div>

                {/* Razão Social */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Razão social <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Informe a razão social"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white placeholder-zinc-400 text-zinc-800 text-xs focus:outline-none rounded-lg"
                    id="input-razaosocial-cad"
                  />
                </div>

                {/* Nome Fantasia */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Nome fantasia
                  </label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    placeholder="Informe o nome fantasia"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white placeholder-zinc-400 text-zinc-800 text-xs focus:outline-none rounded-lg"
                    id="input-nomefantasia-cad"
                  />
                </div>

                {/* Status Toggle */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Status da Empresa <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50/50 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setStatus("Ativa")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        status === "Ativa"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                      id="btn-status-ativa"
                    >
                      Ativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Inativa")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        status === "Inativa"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                      id="btn-status-inativa"
                    >
                      Inativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Suspensa")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        status === "Suspensa"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                      id="btn-status-suspensa"
                    >
                      Suspensa
                    </button>
                  </div>
                </div>

                {/* Data de Abertura */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Data de abertura <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dataAbertura}
                      onChange={(e) => setDataAbertura(e.target.value)}
                      placeholder="dd/mm/aaaa"
                      className="w-full pl-3 pr-9 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    />
                    <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 h-3.5 w-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Data de Baixa (Opcional) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Data de baixa <span className="text-zinc-500 text-[9px]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dataBaixa}
                      onChange={(e) => setDataBaixa(e.target.value)}
                      placeholder="dd/mm/aaaa"
                      className="w-full pl-3 pr-9 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    />
                    <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 h-3.5 w-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Endereço e contato */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">2</span>
                Localização e Informações de Contato
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* CEP with lookup */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    CEP <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className={`w-full pl-3 pr-11 py-2 border text-xs transition-all rounded-lg focus:outline-none focus:ring-2 ${
                        isCepValid
                          ? "border-emerald-500 bg-emerald-50/10 focus:ring-emerald-500/15 focus:border-emerald-600 text-emerald-900"
                          : isCepIncomplete
                          ? "border-rose-400 bg-rose-50/10 focus:ring-rose-500/15 focus:border-rose-500 text-rose-900"
                          : "border-zinc-200 bg-white placeholder-zinc-400 text-zinc-800 focus:ring-emerald-500/15 focus:border-emerald-600"
                      }`}
                      id="input-cep-cad"
                    />
                    <button
                      type="button"
                      onClick={searchCep}
                      disabled={isSearchingCep || isCepIncomplete}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer ${
                        isSearchingCep
                          ? "bg-zinc-100 text-zinc-400 cursor-wait"
                          : isCepValid
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10"
                          : isCepIncomplete
                          ? "bg-zinc-50 text-zinc-350 border border-zinc-100 cursor-not-allowed"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      }`}
                      id="btn-consultar-cep"
                      title={isCepIncomplete ? "Preencha o CEP completo" : "Consultar CEP"}
                    >
                      {isSearchingCep ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {isCepValid && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <Check className="h-3 w-3 stroke-[2.5]" /> CEP válido para consulta
                    </p>
                  )}
                  {isCepIncomplete && (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" /> CEP incompleto (8 dígitos)
                    </p>
                  )}
                </div>

                {/* Logradouro */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Logradouro <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Informe o logradouro"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    id="input-logradouro-cad"
                  />
                </div>

                {/* Número */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Número"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    id="input-numero-cad"
                  />
                </div>

                {/* Complemento */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apartamento, sala, bloco..."
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                  />
                </div>

                {/* Bairro */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Bairro <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Informe o bairro"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                  />
                </div>

                {/* Município Select mock */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Município <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs appearance-none focus:outline-none rounded-lg"
                    >
                      <option value="Belo Horizonte">Belo Horizonte</option>
                      <option value="São Paulo">São Paulo</option>
                      <option value="Rio de Janeiro">Rio de Janeiro</option>
                      <option value="Brasília">Brasília</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                {/* UF select */}
                <div className="md:col-span-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block text-center">
                    UF <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                      className="w-full px-2 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs appearance-none focus:outline-none text-center font-bold rounded-lg"
                    >
                      <option value="MG">MG</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="DF">DF</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 h-3 w-3 pointer-events-none" />
                  </div>
                </div>

                {/* E-mail Contact */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    E-mail de Contato <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="financeiro@empresa.com.br"
                      className="w-full pl-9 pr-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  </div>
                </div>

                {/* Telefone */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Telefone de Contato <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-9 pr-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Parâmetros Fiscais */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">3</span>
                Parâmetros Fiscais e Enquadramento
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Regime tributário select */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Regime tributário <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={regimeTributario}
                      onChange={(e) => setRegimeTributario(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs appearance-none focus:outline-none rounded-lg"
                    >
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                      <option value="Lucro Real">Lucro Real</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                {/* Inscrição Municipal */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Inscrição municipal
                  </label>
                  <input
                    type="text"
                    value={inscricaoMunicipal}
                    onChange={(e) => setInscricaoMunicipal(e.target.value)}
                    placeholder="Inscrição municipal"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                  />
                </div>

                {/* CNAE principal */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    CNAE principal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cnaePrincipal}
                    onChange={(e) => setCnaePrincipal(e.target.value)}
                    placeholder="Ex: 62.01-5/01"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                  />
                </div>

                {/* Tratamento Tributário Global */}
                <div className="md:col-span-12 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    ANEXO DA EMPRESA
                  </label>
                  <div className="relative">
                    <select
                      value={tratamentoTributarioGlobal}
                      onChange={(e) => setTratamentoTributarioGlobal(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs appearance-none focus:outline-none rounded-lg"
                    >
                      <option value="AUTOMATICO SISTEMA">AUTOMATICO SISTEMA</option>
                      <option value="Comércio — Anexo I">Comércio — Anexo I</option>
                      <option value="Indústria — Anexo II">Indústria — Anexo II</option>
                      <option value="Serviço — Anexo III sem Fator R">Serviço — Anexo III sem Fator R</option>
                      <option value="Serviço — Anexo IV">Serviço — Anexo IV</option>
                      <option value="Serviço sujeito ao Fator R">Serviço sujeito ao Fator R</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                {/* CNAEs secundários (Textarea) */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    CNAEs secundários secundários
                  </label>
                  <textarea
                    value={cnaeSecundarios}
                    onChange={(e) => setCnaeSecundarios(e.target.value)}
                    placeholder="Um CNAE por linha (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg resize-none"
                  />
                </div>

                {/* Município de incidência padrão */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                    Município de incidência padrão <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={municipioIncidencia}
                    onChange={(e) => setMunicipioIncidencia(e.target.value)}
                    placeholder="Ex: Belo Horizonte - MG"
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg"
                  />
                </div>

                {/* Observações fiscais */}
                <div className="md:col-span-12 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
                      Observações fiscais
                    </label>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      {observacoesFiscais.length}/500
                    </span>
                  </div>
                  <textarea
                    maxLength={500}
                    value={observacoesFiscais}
                    onChange={(e) => setObservacoesFiscais(e.target.value)}
                    placeholder="Digite anotações fiscais internas importantes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs focus:outline-none rounded-lg resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Section Actions */}
            <div className="flex justify-between items-center pt-4">
              {isEditingCompany ? (
                <button
                  type="button"
                  onClick={() => setCompanyToDelete(cnpj)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir Empresa
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage("empresas")}
                  className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 border border-zinc-200 rounded-lg text-zinc-700 font-black text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer h-8 flex items-center justify-center select-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveCompanyConfig}
                  disabled={isSavingCompany || isSaveSuccess}
                  className={`px-3.5 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed h-8 ${
                    isSaveSuccess
                      ? "bg-emerald-500 text-white hover:bg-emerald-500"
                      : isSavingCompany
                      ? "bg-emerald-700/80 text-white hover:bg-emerald-700/80 cursor-wait"
                      : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white hover:shadow-md"
                  }`}
                  id="btn-salvar-empresa-bottom"
                >
                  {isSavingCompany ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                      <span>Salvando...</span>
                    </>
                  ) : isSaveSuccess ? (
                    <motion.div 
                      className="flex items-center gap-1.5"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="h-4 w-4 stroke-[3px]" />
                      <span>Salvo com sucesso!</span>
                    </motion.div>
                  ) : (
                    <span>{isEditingCompany ? "Salvar Alterações" : "Salvar Empresa"}</span>
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        )}
        </AnimatePresence>
        
        {/* Delete Confirmation Dialog */}
        {companyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-black text-zinc-900">Excluir Empresa</h3>
              <p className="text-zinc-500 text-sm mt-2">Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setCompanyToDelete(null)} className="flex-1 py-2 bg-zinc-100 rounded-lg text-zinc-700 font-bold">Cancelar</button>
                <button onClick={handleDeleteCompany} className="flex-1 py-2 bg-red-600 rounded-lg text-white font-bold">Excluir</button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
