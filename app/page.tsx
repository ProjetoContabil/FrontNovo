"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
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
  Trash2,
  LockKeyhole,
  Plus,
  Receipt,
  LayoutDashboard,
  Users,
  Copy,
  AlertTriangle,
  Calculator,
  Sparkles
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
  statusEmpresa: "Ativa" | "Inativa" | "Suspensa";
}

export default function Page() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<"dashboard" | "empresas" | "cadastro_empresa" | "certificados" | "procuracoes" | "relatorios" | "configuracoes" | "perfil_escritorio" | "pgdas">("dashboard");
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegime, setFilterRegime] = useState("all");
  const [filterAcesso, setFilterAcesso] = useState("all");

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
  }, [searchTerm, filterRegime, filterAcesso, companiesPage]);

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
  const [status, setStatus] = useState<"Ativa" | "Inativa" | "Suspensa">("Ativa");
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
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [cnaePrincipal, setCnaePrincipal] = useState("");
  const [cnaeSecundarios, setCnaeSecundarios] = useState("");
  const [municipioIncidencia, setMunicipioIncidencia] = useState("");
  const [observacoesFiscais, setObservacoesFiscais] = useState("");
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // ==========================================
  // STATE: PGDAS-D APURAÇÃO
  // ==========================================
  const [pgdasStep, setPgdasStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [pgdasEmpresaCnpj, setPgdasEmpresaCnpj] = useState("53.855.322/0001-95");
  const [pgdasEmpresaName, setPgdasEmpresaName] = useState("NAIALE AUGUSTINHO CONTABILIDADE LTDA");
  const [pgdasCompetencia, setPgdasCompetencia] = useState("2026-06");
  const [pgdasStatus, setPgdasStatus] = useState("Em preenchimento");
  const [xmlStandard, setXmlStandard] = useState("Portal Nacional — NT 009");
  const [pgdasFiles, setPgdasFiles] = useState<{ name: string; size: string; status: "processando" | "sucesso" | "erro" }[]>([]);
  const [isUploadingPgdas, setIsUploadingPgdas] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [pgdasDraft, setPgdasDraft] = useState({
    receitaComercio: 12450.00,
    receitaServico: 32780.00,
    rbt12: 542760.00,
    isSubmitted: false
  });
  const [metodoAcesso, setMetodoAcesso] = useState<"certificado" | "procuracao">("certificado");
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
  const [escritorioPlano, setEscritorioPlano] = useState("Plano Profissional");
  const [escritorioLogoLetter, setEscritorioLogoLetter] = useState("A");

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pfx" || ext === "p12") {
        setUploadedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
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
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
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
    
    // Normalize CNPJ
    const targetCnpj = cnpj || "99.999.999/0001-99";
    const exists = companies.some(c => c.cnpj === targetCnpj);

    if (exists) {
      setCompanies(prev => prev.map(c => c.cnpj === targetCnpj ? {
        ...c,
        razaoSocial: razaoSocial.toUpperCase(),
        nomeFantasia: nomeFantasia ? nomeFantasia.toUpperCase() : razaoSocial.toUpperCase(),
        regimeTributario,
        uf: uf || "MG",
        municipio: municipio || "Belo Horizonte",
        statusEmpresa: status
      } : c));
      addToast(`Empresa "${razaoSocial.toUpperCase()}" atualizada com sucesso!`, "success");
    } else {
      const newCompany: Company = {
        cnpj: targetCnpj,
        razaoSocial: razaoSocial.toUpperCase(),
        nomeFantasia: nomeFantasia ? nomeFantasia.toUpperCase() : razaoSocial.toUpperCase(),
        regimeTributario,
        uf: uf || "MG",
        municipio: municipio || "Belo Horizonte",
        statusAcesso: "Não Configurado",
        statusPgdas: "Pendente",
        periodoApuracao: "Junho/2026",
        statusEmpresa: status
      };
      setCompanies(prev => [newCompany, ...prev]);
      addToast(`Empresa "${razaoSocial.toUpperCase()}" cadastrada com sucesso!`, "success");
      setShowNextStep(true);
    }
  };

  const editCompany = (company: Company) => {
    setCnpj(company.cnpj);
    setRazaoSocial(company.razaoSocial);
    setNomeFantasia(company.nomeFantasia);
    setRegimeTributario(company.regimeTributario);
    setUf(company.uf);
    setMunicipio(company.municipio);
    setStatus(company.statusEmpresa || "Ativa");
    
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
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl hover:bg-zinc-100/80 transition-all cursor-pointer border border-zinc-200/60 bg-[#f9fafb] text-[#1e2696] shadow-xs h-9">
        <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm transition-all">
          NA
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 shrink-0 transition-colors" />
      </div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 border-b border-zinc-100 mb-1">
          <p className="text-xs font-black text-zinc-900 leading-none">NAIALE AUGUSTINHO</p>
          <p className="text-[9px] text-zinc-400 font-bold mt-1">tenant: naiale-augustinho...</p>
        </div>
        <button 
          onClick={() => addToast("Meu Perfil indisponível neste protótipo.", "info")}
          className="w-full text-left px-2 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <User className="h-3.5 w-3.5" /> Meu Perfil
        </button>
        <button 
          onClick={() => addToast("Configurações indisponíveis neste protótipo.", "info")}
          className="w-full text-left px-2 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" /> Configurações
        </button>
        <button 
          onClick={() => addToast("Sessão encerrada neste protótipo.", "info")}
          className="w-full text-left px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
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

    return matchesSearch && matchesRegime && matchesAcesso;
  });

  const totalCompaniesItems = filteredCompanies.length;
  const totalCompaniesPages = Math.ceil(totalCompaniesItems / companiesPerPage);
  const activeCompaniesPage = Math.min(companiesPage, totalCompaniesPages || 1);
  const startCompanyIndex = (activeCompaniesPage - 1) * companiesPerPage;
  const paginatedCompanies = filteredCompanies.slice(startCompanyIndex, startCompanyIndex + companiesPerPage);

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
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-inner">
            {platformInitials}
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-zinc-100">{platformName}</h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Plataforma Fiscal Premium</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Profile in Mobile Header */}
          <div className="flex items-center gap-2 p-1 px-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60" id="mobile-header-user">
            <div className="h-6 w-6 rounded bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
              NA
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black tracking-widest text-base shadow-md shadow-emerald-500/15 shrink-0">
              {platformInitials}
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]"
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
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 mt-4">Principal</div>}

              {/* Menu Item - Dashboard */}
              <button
                onClick={() => { setCurrentPage("dashboard"); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "dashboard"
                    ? "bg-[#27272a] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
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
                    Painel Geral
                  </span>
                </div>
              </button>

              {/* SECTION: ESCRITÓRIO */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 mt-6">Escritório</div>}

              {/* Menu Item - Perfil */}
              <button
                onClick={() => {
                  setCurrentPage("perfil_escritorio");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "perfil_escritorio"
                    ? "bg-[#27272a] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
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
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 mt-6">Gestão de Clientes</div>}

              {/* Menu Item - Empresas */}
              <button
                onClick={() => {
                  setCurrentPage("empresas");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  (currentPage === "empresas" || currentPage === "cadastro_empresa")
                    ? "bg-[#27272a] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <Building2 
                      className={`h-4.5 w-4.5 ${
                        (currentPage === "empresas" || currentPage === "cadastro_empresa") ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                      }`} 
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                    Lista de Empresas
                  </span>
                </div>
              </button>

              {/* Menu Item - Certificados */}
              <button
                onClick={() => {
                  setCurrentPage("certificados");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "certificados"
                    ? "bg-[#27272a] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
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

              {/* SECTION: DEPARTAMENTO FISCAL */}
              {!sidebarCollapsed && <div className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 mt-6">Departamento Fiscal</div>}

              {/* Menu Item - Fiscal */}
              <button
                onClick={() => setIsFiscalMenuOpen(!isFiscalMenuOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "pgdas"
                    ? "bg-[#27272a] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
                }`}
                id="nav-fiscal"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                    <Receipt
                      className={`h-4.5 w-4.5 ${
                        currentPage === "pgdas" ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
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
                <div className="pl-12 pr-4 space-y-1 mt-1 overflow-hidden transition-all">
                  <div className="relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-zinc-800 py-1 space-y-1">
                    <button 
                      onClick={() => { setCurrentPage("pgdas"); setSidebarOpen(false); }} 
                      className={`w-full flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg text-[12px] font-bold transition-all relative group ${
                        currentPage === "pgdas" 
                          ? "text-zinc-100 bg-[#27272a]" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-[#27272a]/50"
                      }`}
                    >
                      {/* Active indicator dot */}
                      {currentPage === "pgdas" && (
                        <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                      )}
                      <FileCheck className={`h-3.5 w-3.5 ${currentPage === "pgdas" ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-400"}`} strokeWidth={2} />
                      Apuração PGDAS
                    </button>
                    

                  </div>
                </div>
              )}
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
      <main className="flex-1 overflow-y-auto px-5 py-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-300">
        
        {/* DESKTOP TOP HEADER REMOVED FOR BETTER VISUAL SPACE UTILIZATION */}
        
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
            {/* Header: Logotipo, Nome, CNPJ, Status, Plano */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="h-24 bg-zinc-900/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-15 mix-blend-overlay"></div>
              </div>
              <div className="px-6 sm:px-8 pb-8 pt-0 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
                <div className="h-24 w-24 rounded-2xl bg-white p-2 border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center relative group">
                  <div className="bg-emerald-600 w-full h-full rounded-xl flex items-center justify-center text-white font-display font-black text-3xl uppercase shadow-inner">
                    {escritorioLogoLetter || "A"}
                  </div>
                  {isEditingProfileForm && (
                    <button 
                      onClick={() => {
                        const nextLetters = ["A", "B", "C", "K", "S", "X"];
                        const currentIdx = nextLetters.indexOf(escritorioLogoLetter);
                        const nextLetter = nextLetters[(currentIdx + 1) % nextLetters.length];
                        setEscritorioLogoLetter(nextLetter);
                        addToast(`Logotipo alterado para a letra "${nextLetter}"`, "info");
                      }}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] font-extrabold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                    >
                      Alterar Letra
                    </button>
                  )}
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

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {isEditingProfileForm ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setIsEditingProfileForm(false);
                              addToast("Edição cadastral descartada.", "info");
                            }}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-zinc-200"
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
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
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
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Editar cadastro
                        </button>
                      )}
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
                      className="bg-white hover:bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setProfileTab("equipe")}
                      className="bg-white hover:bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                      className="bg-white hover:bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                          <Shield className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    <a 
                      href="#pendencias-section"
                      className="bg-white hover:bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500/20 block"
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
                          className="px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
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
                          className="px-3.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
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
                          className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
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
                        <h4 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-500" />
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

              {/* ABA 3: RESPONSÁVEL TÉCNICO */}
              {false && (
                <motion.div
                  key="responsaveis"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-4 gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          Contadores Técnicos Ativos
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Esses profissionais assinam digitalmente e representam o escritório perante a fiscalização do CRC e Receita.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setRespNome("");
                          setRespCpf("");
                          setRespEmail("");
                          setRespTelefone("");
                          setRespCrc("");
                          setRespEstadoCrc("AL");
                          setRespCategoria("Contador");
                          setRespSituacao("Ativo");
                          setRespValidadeCrc("31/12/2026");
                          setRespPrincipal(false);
                          setShowAddResponsavelModal(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Contador
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {responsaveis.map((resp) => (
                        <div 
                          key={resp.id} 
                          className={`rounded-2xl border p-5 space-y-4 relative overflow-hidden transition-all ${
                            resp.principal 
                              ? "bg-emerald-50/20 border-emerald-300 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.05)]" 
                              : "bg-white border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {resp.principal && (
                            <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Principal
                            </span>
                          )}

                          <div className="space-y-1">
                            <h4 className="font-bold text-zinc-900 text-base">{resp.nome}</h4>
                            <p className="text-xs text-zinc-400 font-semibold">{resp.categoria} · CRC: {resp.crc} ({resp.estadoCrc})</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">CPF</p>
                              <p className="font-semibold text-zinc-800">{resp.cpf}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Telefone</p>
                              <p className="font-semibold text-zinc-800">{resp.telefone}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">E-mail</p>
                              <p className="font-semibold text-zinc-800 break-all">{resp.email}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Situação CRC</p>
                              <p className="font-bold text-emerald-600">{resp.situacao}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Validade CRC</p>
                              <p className="font-bold text-zinc-800">{resp.validadeCrc || "Ininterrupto"}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-zinc-100">
                            {!resp.principal && (
                              <button 
                                onClick={() => {
                                  // Archive the previous principal, and set this one as principal
                                  const oldPrincipal = responsaveis.find(r => r.principal);
                                  
                                  // Add substitution log to history
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

                                  // Update states
                                  setResponsaveis(prev => prev.map(r => ({
                                    ...r,
                                    principal: r.id === resp.id
                                  })));
                                  
                                  addToast(`Substituição realizada! ${resp.nome} agora é o responsável principal.`, "success");
                                }}
                                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Tornar responsável principal
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (resp.principal) {
                                  addToast("Não é possível remover o responsável principal ativo sem antes eleger outro.", "error");
                                  return;
                                }
                                if (confirm("Deseja realmente remover este responsável?")) {
                                  setResponsaveis(prev => prev.filter(r => r.id !== resp.id));
                                  addToast("Contador removido com sucesso.", "success");
                                }
                              }}
                              className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIMELINE HISTÓRICO DE RESPONSÁVEIS */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Histórico de Responsáveis Anteriores (Auditoria)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Os registros abaixo nunca são deletados. Eles servem como prova jurídica de responsabilidade técnica de períodos passados para auditorias internas e fiscais.
                      </p>
                    </div>

                    <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-400 text-[10px] uppercase font-black tracking-wider">
                            <th className="p-4">Profissional Anterior</th>
                            <th className="p-4">Data de Início</th>
                            <th className="p-4">Data de Saída</th>
                            <th className="p-4">Substituído Por</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-zinc-100 font-semibold text-zinc-700">
                          {historicoResponsaveis.map((h) => (
                            <tr key={h.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="p-4 font-bold text-zinc-900">{h.nomeAnterior}</td>
                              <td className="p-4 text-zinc-500">{h.dataInicial}</td>
                              <td className="p-4 text-zinc-500">{h.dataFinal}</td>
                              <td className="p-4">
                                <span className="bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                                  {h.usuarioSubstituicao}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* ABA 4: EQUIPE E ACESSOS */}
              {false && (
                <motion.div
                  key="equipe"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                          <Users className={`w-4 h-4 ${theme.text}`} />
                          Gestão de Equipe e Controle de Acessos
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Gerencie as permissões dos analistas tributários, envie novos convites de acesso e administre o time do escritório.
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          setInviteNome("");
                          setInviteEmail("");
                          setInviteCargo("");
                          setInviteAcesso("Operador");
                          setShowInviteMemberModal(true);
                        }}
                        className={`px-4 py-2 ${theme.bg} ${theme.hoverBg} text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer`}
                      >
                        <Plus className="w-4 h-4" />
                        Convidar Colaborador
                      </button>
                    </div>

                    {/* Team Members List */}
                    <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400">
                            <th className="p-4">Colaborador</th>
                            <th className="p-4">Cargo / Função</th>
                            <th className="p-4">Perfil de Acesso</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-zinc-700 divide-y divide-zinc-100">
                          {teamMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-zinc-50/40 transition-colors">
                              <td className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                                  {member.nome.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-zinc-900">{member.nome}</p>
                                  <p className="text-[10px] text-zinc-400 font-medium">{member.email}</p>
                                </div>
                              </td>
                              <td className="p-4 font-medium text-zinc-500">{member.cargo}</td>
                              <td className="p-4">
                                {member.acesso === "Proprietário" ? (
                                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                                    Proprietário
                                  </span>
                                ) : (
                                  <select 
                                    value={member.acesso}
                                    onChange={(e) => {
                                      const oldAccess = member.acesso;
                                      const newAccess = e.target.value;
                                      setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, acesso: newAccess } : m));
                                      addAuditLog("Alteração de acesso de equipe", `${member.nome} (${oldAccess})`, `Novo acesso: ${newAccess}`);
                                      addToast(`Perfil de acesso de ${member.nome} alterado para ${newAccess}!`, "success");
                                    }}
                                    className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none focus:border-emerald-500 text-zinc-700 cursor-pointer"
                                  >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Operador">Operador</option>
                                    <option value="Auditor">Auditor</option>
                                  </select>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded border ${
                                  member.status === "Ativo" 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : member.status === "Pendente" 
                                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2 text-[11px] font-bold">
                                  {member.status === "Pendente" && (
                                    <button 
                                      onClick={() => {
                                        addToast(`Convite de acesso reenviado com sucesso para ${member.email}!`, "success");
                                        addAuditLog("Reenvio de convite", "-", `Destinatário: ${member.email}`);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                    >
                                      Reenviar Convite
                                    </button>
                                  )}

                                  {member.acesso !== "Proprietário" && member.status === "Ativo" && (
                                    <button 
                                      onClick={() => {
                                        setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: "Suspenso" } : m));
                                        addAuditLog("Suspensão de acesso de colaborador", member.nome, "Status: Suspenso");
                                        addToast(`O acesso do colaborador ${member.nome} foi suspenso temporariamente.`, "info");
                                      }}
                                      className="text-rose-600 hover:text-rose-700 cursor-pointer"
                                    >
                                      Suspender
                                    </button>
                                  )}

                                  {member.status === "Suspenso" && (
                                    <button 
                                      onClick={() => {
                                        setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: "Ativo" } : m));
                                        addAuditLog("Reativação de acesso de colaborador", member.nome, "Status: Ativo");
                                        addToast(`O acesso do colaborador ${member.nome} foi reativado com sucesso!`, "success");
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                    >
                                      Ativar
                                    </button>
                                  )}

                                  {member.acesso === "Proprietário" && (
                                    <button 
                                      onClick={() => {
                                        setTransferOwnerOpen(true);
                                        addToast("Selecione o novo proprietário no painel de transferência legal abaixo.", "info");
                                      }}
                                      className="text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
                                    >
                                      <Shield className="w-3.5 h-3.5" />
                                      Transferir Propriedade
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Ownership Transfer Module */}
                    {transferOwnerOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-purple-50/30 border border-purple-100 rounded-2xl p-5 md:p-6 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">Transferência Legal de Propriedade do Escritório</h4>
                            <p className="text-[11px] text-purple-700 font-semibold mt-0.5 leading-relaxed">
                              Esta é uma ação jurídica de segurança. Ao transferir a propriedade, você abdica do controle mestre do escritório. O novo proprietário terá permissão exclusiva para redefinir cadastros legalmente.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end text-xs font-semibold">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-900 uppercase">Selecione o Novo Proprietário do Escritório</label>
                            <select 
                              value={newOwnerId}
                              onChange={(e) => setNewOwnerId(e.target.value)}
                              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-purple-500 text-zinc-800 animate-none"
                            >
                              <option value="">-- Escolha um colaborador ativo --</option>
                              {teamMembers.filter(m => m.acesso !== "Proprietário" && m.status === "Ativo").map((m) => (
                                <option key={m.id} value={m.id}>{m.nome} ({m.cargo})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (!newOwnerId) {
                                  addToast("Selecione o colaborador destinatário!", "error");
                                  return;
                                }
                                const target = teamMembers.find(m => m.id === newOwnerId);
                                if (!target) return;

                                // Perform legal transfer
                                setTeamMembers(prev => prev.map(m => {
                                  if (m.acesso === "Proprietário") {
                                    return { ...m, acesso: "Administrador" };
                                  }
                                  if (m.id === target.id) {
                                    return { ...m, acesso: "Proprietário" };
                                  }
                                  return m;
                                }));

                                addAuditLog("Transferência legal de propriedade do escritório", "Naiale Augustinho", `Novo proprietário: ${target.nome}`);
                                addToast(`Propriedade transferida com sucesso para ${target.nome}!`, "success");
                                setTransferOwnerOpen(false);
                                setNewOwnerId("");
                              }}
                              className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center shadow-sm"
                            >
                              Confirmar Transferência
                            </button>
                            <button 
                              onClick={() => {
                                setTransferOwnerOpen(false);
                                setNewOwnerId("");
                              }}
                              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ABA 5: PREFERÊNCIAS */}
              {false && (
                <motion.div
                  key="preferencias"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* PERSONALIZAÇÃO DA MARCA / PLATAFORMA */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                        Personalização da Marca / Plataforma (White Label)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Configure o nome e as iniciais da plataforma que aparecem no menu lateral e cabeçalhos do sistema. Ideal para escritórios que utilizam white-label ou desejam personalizar a identidade visual do portal do cliente.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome da Plataforma (No Menu)</label>
                        <input 
                          type="text"
                          value={platformName}
                          onChange={(e) => {
                            setPlatformName(e.target.value);
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700"
                          placeholder="Ex: PGDAS-D"
                        />
                        <p className="text-[10px] text-zinc-400 font-medium">Nome exibido no topo do menu lateral e no cabeçalho mobile.</p>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Iniciais / Sigla do Logotipo</label>
                        <input 
                          type="text"
                          value={platformInitials}
                          onChange={(e) => {
                            setPlatformInitials(e.target.value.substring(0, 3).toUpperCase());
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700 font-mono"
                          placeholder="Ex: PG"
                        />
                        <p className="text-[10px] text-zinc-400 font-medium">Até 3 letras. É o logotipo circular/quadrado do sistema.</p>
                      </div>

                      {/* LIVE SIDEBAR PREVIEW BOX */}
                      <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-between border border-zinc-900 shadow-inner">
                        <div className="space-y-1.5 flex-1">
                          <p className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">Pré-visualização do Menu</p>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black tracking-widest text-base shadow-md shadow-emerald-500/15 shrink-0">
                              {platformInitials || "PG"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-white text-xs tracking-tight truncate leading-none font-display">
                                {platformName || "PGDAS-D"}
                              </p>
                              <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Visualização do Menu Lateral</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONFIGURAÇÕES OPERACIONAIS */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <Settings className={`w-4 h-4 ${theme.text}`} />
                        Configurações Operacionais e Sede Padrão
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Defina as convenções internas e regimes fiscais sugeridos automaticamente para agilizar a rotina tributária do escritório.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Regime Tributário Padrão</label>
                        <select 
                          value={defaultRegime}
                          onChange={(e) => setDefaultRegime(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700 cursor-pointer"
                        >
                          <option value="Simples Nacional">Simples Nacional</option>
                          <option value="Lucro Presumido">Lucro Presumido</option>
                          <option value="Lucro Real">Lucro Real</option>
                        </select>
                        <p className="text-[10px] text-zinc-400 font-medium">Sugerido por padrão no cadastro de novas empresas clientes.</p>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Estado (UF) Sede Fiscal</label>
                        <select 
                          value={defaultUf}
                          onChange={(e) => setDefaultUf(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700 cursor-pointer"
                        >
                          <option value="AL">Maceió - AL (Padrão Sede)</option>
                          <option value="SP">São Paulo - SP</option>
                          <option value="MG">Belo Horizonte - MG</option>
                          <option value="RJ">Rio de Janeiro - RJ</option>
                        </select>
                        <p className="text-[10px] text-zinc-400 font-medium">UF legal para automatizações e calendários estaduais específicos.</p>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Horário de Expediente Fiscal</label>
                        <select 
                          defaultValue="comercial"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700 cursor-pointer"
                        >
                          <option value="comercial">Comercial (08:00 às 18:00)</option>
                          <option value="flexivel">Flexível (07:00 às 22:00)</option>
                        </select>
                        <p className="text-[10px] text-zinc-400 font-medium">Período para envio de alertas automatizados aos clientes.</p>
                      </div>
                    </div>
                  </div>

                  {/* CANAIS E ALERTAS DE NOTIFICAÇÕES */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${theme.text}`} />
                        Canais de Comunicação e Alertas Operacionais
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Controle os eventos que geram avisos imediatos no painel e configure o canal principal de notificações fiscais.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                      {/* Left: Channel Selector */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Canal Principal de Comunicação</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "email", label: "E-mail", desc: "Suporte padrão" },
                            { id: "whatsapp", label: "WhatsApp", desc: "Avisos rápidos" },
                            { id: "sms", label: "SMS Legal", desc: "Notificações" }
                          ].map((chan) => (
                            <button 
                              key={chan.id}
                              onClick={() => setPrefNotificationChannel(chan.id as any)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                                prefNotificationChannel === chan.id 
                                  ? "border-zinc-955 bg-zinc-50 shadow-xs" 
                                  : "border-zinc-200 hover:border-zinc-300 bg-white"
                              }`}
                            >
                              <span className="font-extrabold text-zinc-900">{chan.label}</span>
                              <span className="text-[10px] text-zinc-400 font-medium">{chan.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Toggle options */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Eventos Monitorados de Compliance</h4>
                        
                        <div className="space-y-3">
                          {/* Option 1 */}
                          <div className="flex justify-between items-center py-1">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-zinc-900">Alertas de Vencimento de CRC</p>
                              <p className="text-[10px] text-zinc-400 font-medium">Avisar com antecedência de 60, 30 e 15 dias do vencimento.</p>
                            </div>
                            <button 
                              onClick={() => setPrefAlertCrc(!prefAlertCrc)}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                                prefAlertCrc ? "bg-emerald-600" : "bg-zinc-300"
                              }`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                                prefAlertCrc ? "left-5.5" : "left-0.5"
                              }`} />
                            </button>
                          </div>

                          {/* Option 2 */}
                          <div className="flex justify-between items-center py-1">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-zinc-900">Alertas de Vencimento de Certificados</p>
                              <p className="text-[10px] text-zinc-400 font-medium">Monitorar chaves A1/A3 e notificar vencimentos críticos.</p>
                            </div>
                            <button 
                              onClick={() => setPrefAlertCert(!prefAlertCert)}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                                prefAlertCert ? "bg-emerald-600" : "bg-zinc-300"
                              }`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                                prefAlertCert ? "left-5.5" : "left-0.5"
                              }`} />
                            </button>
                          </div>

                          {/* Option 3 */}
                          <div className="flex justify-between items-center py-1">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-zinc-900">Alertas de Falha de Sincronização Fiscal</p>
                              <p className="text-[10px] text-zinc-400 font-medium">Notificar imediatamente se um canal municipal requerer reautenticação.</p>
                            </div>
                            <button 
                              onClick={() => setPrefAlertRobot(!prefAlertRobot)}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                                prefAlertRobot ? "bg-emerald-600" : "bg-zinc-300"
                              }`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                                prefAlertRobot ? "left-5.5" : "left-0.5"
                              }`} />
                            </button>
                          </div>

                          {/* Option 4 */}
                          <div className="flex justify-between items-center py-1">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-zinc-900">Relatórios Mensais por E-mail</p>
                              <p className="text-[10px] text-zinc-400 font-medium">Resumos automatizados com todas as obrigações e pendências resolvidas.</p>
                            </div>
                            <button 
                              onClick={() => setReceiveEmailReport(!receiveEmailReport)}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                                receiveEmailReport ? "bg-emerald-600" : "bg-zinc-300"
                              }`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                                receiveEmailReport ? "left-5.5" : "left-0.5"
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEGURANÇA OPERACIONAL */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <LockKeyhole className={`w-4 h-4 ${theme.text}`} />
                        Segurança e Políticas Operacionais do Inquilino
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Gerencie as regras de segurança adicionais para manter as informações cadastrais e fiscais do escritório protegidas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Tempo Limite de Sessão do Sistema</label>
                        <select 
                          value={prefSessionTimeout}
                          onChange={(e) => setPrefSessionTimeout(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-zinc-700 cursor-pointer"
                        >
                          <option value="15m">15 minutos de inatividade</option>
                          <option value="30m">30 minutos de inatividade (Padrão)</option>
                          <option value="1h">1 hora de inatividade</option>
                          <option value="4h">4 horas de inatividade</option>
                        </select>
                        <p className="text-[10px] text-zinc-400 font-medium">Após o período sem uso, o painel exigirá nova reautenticação automática para segurança.</p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Controle de Modificações Críticas</h4>
                        <div className="flex justify-between items-center py-1">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-zinc-900">Confirmação Adicional por Senha</p>
                            <p className="text-[10px] text-zinc-400 font-medium">Exigir senha e confirmação de auditoria antes de atualizar CNPJ ou Responsáveis Técnicos.</p>
                          </div>
                          <button 
                            onClick={() => setPrefSecureConfirm(!prefSecureConfirm)}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              prefSecureConfirm ? "bg-emerald-600" : "bg-zinc-300"
                            }`}
                          >
                            <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                              prefSecureConfirm ? "left-5.5" : "left-0.5"
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 flex justify-end">
                      <button 
                        onClick={() => {
                          addAuditLog("Atualização de preferências gerais", "Padrões cadastrais antigos", `Canal: ${prefNotificationChannel}, Regime: ${defaultRegime}`);
                          addToast("Preferências operacionais e canais de segurança atualizados com sucesso!", "success");
                        }}
                        className={`px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm`}
                      >
                        Salvar Configurações
                      </button>
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
                      className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
                      className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
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
                      className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer"
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
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
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
                      className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer"
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
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 flex flex-col items-center justify-center h-[70vh]"
          >
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4 border border-zinc-200">
              <LayoutDashboard className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display text-center">Dashboard Principal</h2>
            <p className="text-sm text-zinc-500 text-center max-w-md">Visão geral do sistema e principais métricas do escritório em breve.</p>
          </motion.div>
        )}

        {/* ====================================================================
            VIEW: EMPRESAS (LISTA DE CLIENTES)
            ==================================================================== */}
        {currentPage === "empresas" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 pb-5 mb-1">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <span>Empresas</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Lista de Clientes</h2>
                <p className="text-sm text-zinc-500 mt-1">Monitore e gerencie com exclusividade as credenciais fiscais das suas empresas contratantes.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setCurrentPage("cadastro_empresa")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-md h-9"
                  id="btn-nova-empresa-top"
                >
                  <Plus className="h-4 w-4" />
                  Nova Empresa
                </button>
                <div className="hidden md:block">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  title: "Empresas Ativas", 
                  value: companies.length.toString(), 
                  change: "Atualizado em tempo real", 
                  icon: Building2, 
                  color: "text-emerald-600 bg-emerald-50/75 border-emerald-100" 
                },
                { 
                  title: "Acessos Configurados", 
                  value: companies.filter(c => c.statusAcesso !== "Não Configurado").length.toString(), 
                  change: "Prontos para transmissão", 
                  icon: FileCheck, 
                  color: "text-teal-600 bg-teal-50/75 border-teal-100" 
                },
                { 
                  title: "Pendentes de Configuração", 
                  value: companies.filter(c => c.statusAcesso === "Não Configurado").length.toString(), 
                  change: "Necessita de credencial", 
                  icon: AlertCircle, 
                  color: "text-amber-600 bg-amber-50/75 border-amber-100" 
                },
                { 
                  title: "Obrigações Entregues", 
                  value: `${companies.length > 0 ? Math.round((companies.filter(c => c.statusPgdas === "Entregue").length / companies.length) * 100) : 100}%`, 
                  change: "Sem atrasos no período", 
                  icon: Clock, 
                  color: "text-zinc-600 bg-zinc-100/75 border-zinc-200" 
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-sm hover:scale-[1.01] transition-all duration-200 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.title}</p>
                      <p className="text-2xl font-black text-zinc-900 mt-1 font-display">{stat.value}</p>
                      <p className="text-[10px] text-zinc-500 font-medium mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl border shrink-0 ${stat.color}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Beautiful Interactive List of Active Clients in Dashboard */}
            <div className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                {/* Search and Filters */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar por razão social ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCompaniesPage(1); }}
                    className="w-full pl-9 pr-4 py-1.5 bg-zinc-50/50 border border-zinc-200 focus:border-emerald-500 focus:bg-white text-xs font-semibold rounded-xl outline-none transition-all placeholder:text-zinc-400 h-9"
                  />
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <select
                    value={filterRegime}
                    onChange={(e) => { setFilterRegime(e.target.value); setCompaniesPage(1); }}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 focus:border-emerald-500 text-xs font-bold rounded-xl outline-none cursor-pointer transition-all text-zinc-600 h-9"
                  >
                    <option value="all">Todos os Regimes</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                  </select>
                  <select
                    value={filterAcesso}
                    onChange={(e) => { setFilterAcesso(e.target.value); setCompaniesPage(1); }}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 focus:border-emerald-500 text-xs font-bold rounded-xl outline-none cursor-pointer transition-all text-zinc-600 h-9"
                  >
                    <option value="all">Todos os Acessos</option>
                    <option value="Configurado">Configurado</option>
                    <option value="Não Configurado">Não Configurado</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-zinc-400 font-bold uppercase tracking-widest text-[9px] border-b border-zinc-100">
                      <th className="pb-3.5 font-semibold">Empresa / CNPJ</th>
                      <th className="pb-3.5 font-semibold">Regime / Localidade</th>
                      <th className="pb-3.5 font-semibold">Acesso Fiscal</th>
                      <th className="pb-3.5 font-semibold">Status da Empresa</th>
                      <th className="pb-3.5 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                    {isLoadingCompanies ? (
                      Array.from({ length: Math.min(companiesPerPage, 5) }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-200 shrink-0" />
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="h-3.5 bg-zinc-200 rounded w-48 sm:w-64" />
                                <div className="h-2.5 bg-zinc-100 rounded w-32" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="space-y-2">
                              <div className="h-3.5 bg-zinc-200 rounded w-28" />
                              <div className="h-2.5 bg-zinc-100 rounded w-20" />
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="h-5.5 bg-zinc-200 rounded-full w-24" />
                          </td>
                          <td className="py-4">
                            <div className="h-5.5 bg-zinc-200 rounded-full w-16" />
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-7 bg-zinc-200 rounded-lg w-12" />
                              <div className="h-7 bg-zinc-200 rounded-lg w-16" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : paginatedCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <Building2 className="h-8 w-8 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
                          <p className="text-zinc-400 text-xs font-bold">Nenhuma empresa encontrada com os filtros selecionados.</p>
                          <button 
                            onClick={() => { setSearchTerm(""); setFilterRegime("all"); setFilterAcesso("all"); }}
                            className="mt-3 text-emerald-600 hover:text-emerald-700 text-[11px] font-black underline cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        </td>
                      </tr>
                    ) : (
                      paginatedCompanies.map((company) => {
                        const initial = company.razaoSocial.charAt(0);
                        return (
                          <tr key={company.cnpj} className="hover:bg-zinc-50/50 transition-colors duration-150">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-500/10 shadow-xs shrink-0">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-zinc-900 truncate max-w-[200px] sm:max-w-xs" title={company.razaoSocial}>
                                    {highlightText(company.razaoSocial, searchTerm)}
                                  </p>
                                  {company.nomeFantasia && company.nomeFantasia !== company.razaoSocial && (
                                    <p className="text-[10px] text-zinc-500 truncate max-w-[200px] sm:max-w-xs" title={company.nomeFantasia}>
                                      {highlightText(company.nomeFantasia, searchTerm)}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                    CNPJ: {highlightCnpj(company.cnpj, searchTerm)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <p className="text-zinc-800 font-bold">{company.regimeTributario}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{company.municipio} - {company.uf}</p>
                            </td>
                            <td className="py-4">
                              {company.statusAcesso === "Não Configurado" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                  Não Configurado
                                </div>
                              ) : company.statusAcesso === "e-CNPJ Ativo" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  e-CNPJ Ativo
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                                  Procuração Ativa
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              {company.statusEmpresa === "Ativa" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  Ativa
                                </div>
                              ) : company.statusEmpresa === "Inativa" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                  Inativa
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100/50 shadow-xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                  Suspensa
                                </div>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => editCompany(company)}
                                  className="px-2.5 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] font-bold hover:bg-zinc-200/80 transition-all cursor-pointer border border-zinc-200/20"
                                >
                                  Editar
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
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                                >
                                  {company.statusAcesso === "Não Configurado" ? "Configurar" : "Gerenciar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
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
            className="space-y-6"
            id="screen-certificado"
          >
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <span>Módulos de Configuração</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Acesso Fiscal</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Certificado e Procuração</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Defina as permissões e credenciais de conexão com o portal oficial da Receita Federal.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 font-bold text-xs transition-colors cursor-pointer text-center h-9 flex items-center justify-center"
                  id="btn-voltar-cert"
                >
                  Voltar ao Início
                </button>
                <button
                  onClick={saveCertificateConfig}
                  className="flex-1 sm:flex-none px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 h-9"
                  id="btn-salvar-config-top"
                >
                  <Save className="h-3.5 w-3.5" />
                  Salvar Configuração
                </button>
                <div className="hidden md:block">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            {/* Selected Company Banner Card */}
            {(() => {
              const currentSelectedCompany = companies.find(c => c.cnpj === selectedCompanyCnpj) || companies[0] || {
                razaoSocial: "LACUNAS LTDA",
                cnpj: "66.378.843/0001-34",
                regimeTributario: "Simples Nacional",
                municipio: "Belo Horizonte",
                uf: "MG",
                statusAcesso: "Não Configurado"
              };
              const hasAccess = currentSelectedCompany.statusAcesso !== "Não Configurado";
              return (
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 h-full w-1.5 ${hasAccess ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                  
                  <div className="space-y-1.5 pl-2">
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-zinc-500">
                      <span className="bg-zinc-100 px-2 py-0.5 rounded">CNPJ: {currentSelectedCompany.cnpj}</span>
                      <span className="bg-zinc-100 px-2 py-0.5 rounded">{currentSelectedCompany.regimeTributario}</span>
                      <span className="bg-zinc-100 px-2 py-0.5 rounded">{currentSelectedCompany.municipio} - {currentSelectedCompany.uf}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-10 pl-2 md:pl-0">
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Identificador único</p>
                      <p className="text-xs font-mono font-bold text-zinc-600 mt-1">cnpj-{currentSelectedCompany.cnpj.replace(/\D/g, "")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Status de acesso</p>
                      {hasAccess ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          {currentSelectedCompany.statusAcesso}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-1">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Módulo Não Integrado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* STEP 1: Método de acesso fiscal */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">1</span>
                Selecione o método de acesso fiscal
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option Card A: Certificado próprio */}
                <div
                  onClick={() => setMetodoAcesso("certificado")}
                  className={`p-4.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative flex gap-4 ${
                    metodoAcesso === "certificado"
                      ? "border-emerald-600 bg-emerald-500/[0.02] shadow-[0_4px_16px_rgba(16,185,129,0.04)]"
                      : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-250 hover:bg-zinc-50"
                  }`}
                  id="opt-certificado-proprio"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${metodoAcesso === "certificado" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                    <FileKey className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pr-6">
                    <h5 className="font-bold text-zinc-900 text-xs">Certificado Digital próprio (e-CNPJ)</h5>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Fazer upload do arquivo de chaves de assinatura do cliente.</p>
                  </div>
                  {metodoAcesso === "certificado" && (
                    <div className="absolute top-4 right-4 h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Option Card B: Procuração escritório */}
                <div
                  onClick={() => setMetodoAcesso("procuracao")}
                  className={`p-4.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative flex gap-4 ${
                    metodoAcesso === "procuracao"
                      ? "border-emerald-600 bg-emerald-500/[0.02] shadow-[0_4px_16px_rgba(16,185,129,0.04)]"
                      : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-250 hover:bg-zinc-50"
                  }`}
                  id="opt-procuracao-escritorio"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${metodoAcesso === "procuracao" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pr-6">
                    <h5 className="font-bold text-zinc-900 text-xs">Procuração Eletrônica (Outorga)</h5>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Utilizar a procuração digital do escritório junto à Receita Federal.</p>
                  </div>
                  {metodoAcesso === "procuracao" && (
                    <div className="absolute top-4 right-4 h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Certificado da empresa (Form details) */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                  <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">2</span>
                  {metodoAcesso === "certificado" ? "Configurar chaves do certificado e-CNPJ" : "Parâmetros de Procuração Fiscal"}
                </h4>
                {metodoAcesso === "certificado" && (
                  <button
                    onClick={() => {
                      setUploadedFile({ name: "certificado_lacunas_2026.pfx", size: "8.4 KB", lastModified: "08/07/2026" });
                      setSenhaCertificado("senha_exemplo_123");
                      addToast("Mock de arquivo preenchido para validação rápida!", "info");
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-all hover:underline"
                  >
                    Auto-preencher arquivo (.pfx)
                  </button>
                )}
              </div>

              {metodoAcesso === "certificado" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Drag & Drop Area */}
                  <div className="lg:col-span-5 space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                      Arquivo do certificado digital <span className="text-rose-500">*</span>
                    </label>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={triggerUploadClick}
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[170px] transition-all duration-200 ${
                        uploadedFile
                          ? "border-emerald-500/40 bg-emerald-500/[0.01]"
                          : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-350 hover:bg-zinc-50"
                      }`}
                      id="cert-dropzone"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pfx,.p12"
                        className="hidden"
                      />
                      {uploadedFile ? (
                        <div className="space-y-3">
                          <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800 truncate max-w-[220px]">{uploadedFile.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{uploadedFile.size} · Modificado em {uploadedFile.lastModified}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                              setIsValidatedCert(false);
                              addToast("Arquivo removido.", "info");
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 mx-auto"
                          >
                            <Trash2 className="h-3 w-3" /> Remover arquivo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto h-10 w-10 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
                            <Upload className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-600">Procurar arquivo de chaves</p>
                            <p className="text-[10px] text-zinc-400 mt-1">Clique para selecionar ou arraste e solte o arquivo .pfx ou .p12</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Form Inputs */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Input - Senha */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                          Senha do certificado <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            key="input-senha-certificado-propria"
                            type={mostrarSenha ? "text" : "password"}
                            value={senhaCertificado}
                            onChange={(e) => setSenhaCertificado(e.target.value)}
                            placeholder="Informe a senha"
                            className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 text-zinc-800"
                            id="input-senha-cert"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-600 font-bold"
                          >
                            {mostrarSenha ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </div>

                      {/* Input - Tipo esperado (Disabled) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                          Tipo esperado
                        </label>
                        <input
                          key="input-tipo-esperado-propria"
                          type="text"
                          value="e-CNPJ"
                          disabled
                          className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-bold"
                        />
                      </div>

                      {/* Input - CNPJ esperado (Disabled) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                          CNPJ de correspondência
                        </label>
                        <input
                          key="input-cnpj-esperado-propria"
                          type="text"
                          value="66.378.843/0001-34"
                          disabled
                          className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-mono font-bold"
                        />
                      </div>

                      {/* Input - Responsável (Disabled) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
                          Responsável pela config
                        </label>
                        <input
                          type="text"
                          value={responsavelConfig}
                          disabled
                          className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-bold"
                        />
                      </div>
                    </div>

                    {/* Progressive live validator loader interface */}
                    <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                          {isValidatingCert ? (
                            <motion.div
                              key="validating-cert-container"
                              initial={{ opacity: 0, height: 0, y: 10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 w-full"
                            >
                              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-650">
                                <RefreshCw className="h-3.5 w-3.5 text-emerald-600 animate-spin shrink-0" />
                                <span className="truncate">{validationProgressMessage}</span>
                                <span className="ml-auto text-[10px] text-zinc-400 font-mono font-bold">{certValidationProgress}%</span>
                              </div>
                              {/* Animated progress bar track */}
                              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-500 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${certValidationProgress}%` }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                              </div>
                            </motion.div>
                          ) : isValidatedCert ? (
                            <motion.div
                              key="validated-cert-container"
                              initial={{ opacity: 0, height: 0, y: 10 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 w-full"
                            >
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <Check className="h-4 w-4 shrink-0" />
                                <span className="truncate">ICP-Brasil chaves em conformidade. Expiração: {certExpiryDate}</span>
                                <span className="ml-auto text-[10px] text-emerald-600 font-mono font-bold">100%</span>
                              </div>
                              {/* Completed animated progress bar track */}
                              <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-600 rounded-full"
                                  initial={{ width: "85%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.p
                              key="idle-cert-container"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5 py-2"
                            >
                              <LockKeyhole className="h-3.5 w-3.5 text-zinc-300" /> Criptografia de ponta a ponta ativa.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        type="button"
                        onClick={validateCertificate}
                        disabled={isValidatingCert}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer h-9 sm:mt-0 mt-2"
                        id="btn-validar-cert"
                      >
                        {isValidatingCert ? "Validando..." : "Validar Certificado"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* METODO ACESSO = PROCURAÇÃO DO ESCRITÓRIO */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/[0.01] rounded-xl border border-emerald-100 flex gap-3 text-xs leading-relaxed max-w-3xl text-zinc-600">
                    <Info className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-zinc-900 text-xs">Informações sobre Outorga Tributária</p>
                      <p className="mt-1 text-[11px]">
                        Ao selecionar este módulo, os serviços automatizados de faturamento e monitoramento fiscal utilizarão o certificado central eletrônico do próprio escritório para assinar as obrigações tributárias de <strong className="text-zinc-800">LACUNAS LTDA</strong>.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">ID Procuração Receita</label>
                      <input
                        type="text"
                        key="input-procuracao-id-field"
                        value={procuracaoId}
                        onChange={(e) => setProcuracaoId(e.target.value)}
                        placeholder="Ex: PR-100293"
                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg text-xs font-medium text-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Vencimento da Procuração</label>
                      <input
                        type="date"
                        key="input-procuracao-vencimento-field"
                        value={procuracaoVencimento}
                        onChange={(e) => setProcuracaoVencimento(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg text-xs text-zinc-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: Alertas de vencimento */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">3</span>
                Alertas automáticos de vencimento
              </h4>
              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">Defina notificações automáticas preventivas por e-mail para manter a conformidade.</p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* Left block checkboxes */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Notificar antes do vencimento</span>
                  
                  <div className="space-y-2.5">
                    {[
                      { checked: alerta30d, setter: setAlerta30d, label: "30 dias de antecedência", id: "chk-alerta-30" },
                      { checked: alerta15d, setter: setAlerta15d, label: "15 dias de antecedência", id: "chk-alerta-15" },
                      { checked: alerta7d, setter: setAlerta7d, label: "7 dias de antecedência", id: "chk-alerta-7" }
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer text-xs font-bold text-zinc-700 select-none">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="h-4 w-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500"
                          id={item.id}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Center / Right inputs */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Destinatário principal</label>
                    <div className="relative">
                      <select
                        value={enviarAlertaPara}
                        onChange={(e) => setEnviarAlertaPara(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold appearance-none focus:outline-none rounded-lg"
                        id="select-envio-alerta"
                      >
                        <option value="Responsável fiscal">Responsável fiscal</option>
                        <option value="Administrador">Administrador da empresa</option>
                        <option value="Escritório">Contador geral do escritório</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">E-mail secundário para aviso</label>
                    <input
                      type="email"
                      value={emailAdicional}
                      onChange={(e) => setEmailAdicional(e.target.value)}
                      placeholder="financeiro@empresa.com.br"
                      className="w-full px-3 py-2 border border-zinc-200 bg-white placeholder-zinc-400 text-zinc-800 text-xs focus:outline-none rounded-lg font-medium"
                      id="input-email-alerta"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/50 flex items-start gap-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Próxima notificação agendada</p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                        {alerta30d
                          ? "Faremos um aviso por e-mail 30 dias antes do vencimento identificado."
                          : alerta15d
                          ? "Faremos um aviso por e-mail 15 dias antes do vencimento identificado."
                          : alerta7d
                          ? "Faremos um aviso por e-mail 7 dias antes do vencimento identificado."
                          : "Nenhum alerta automático configurado!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Resumo da autorização */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/65 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
              <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                <span className="h-5.5 w-5.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">4</span>
                Resumo consolidado da autorização
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Canal Ativo", value: metodoAcesso === "certificado" ? "Certificado e-CNPJ" : "Procuração Digital" },
                  { label: "Certificado", value: isValidatedCert ? `Válido (${certExpiryDate})` : "Pendente de validação", highlight: true, valid: isValidatedCert },
                  { label: "Outorga Procuração", value: metodoAcesso === "procuracao" ? "Ativa (Outorgada)" : "Não necessária" },
                  { label: "Sincronia SERPRO", value: isValidatedCert ? "Ativa & Validada" : "Aguardando chave" },
                  { label: "Serviços Fiscais", value: isValidatedCert ? "Liberados" : "Bloqueados", highlight: true, valid: isValidatedCert }
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-1">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block">{item.label}</span>
                    <p className={`text-xs font-bold leading-snug ${item.highlight ? (item.valid ? "text-emerald-600" : "text-amber-600") : "text-zinc-800"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
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
            className="space-y-6"
            id="screen-pgdas"
          >
            {/* Header Title & Subtitle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight font-display">Apuração PGDAS-D</h2>
                <p className="text-xs md:text-sm text-zinc-500 font-semibold mt-0.5">Do contexto fiscal aos documentos oficiais, com conferência antes da transmissão.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" /> Salvar dados
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-[#1e2696] hover:bg-[#151c6e] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                  <Calculator className="h-4 w-4" /> Calcular prévia
                </button>
              </div>
            </div>

            {/* Steps Navigation Component */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200 shadow-xs relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-zinc-100 -z-10 -translate-y-1/2"></div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 z-10">
                {[
                  { stepNum: 1, label: "Contexto" },
                  { stepNum: 2, label: "Dados fiscais" },
                  { stepNum: 3, label: "Prévia" },
                  { stepNum: 4, label: "Confirmação" },
                  { stepNum: 5, label: "Documentos" },
                ].map((s, idx) => {
                  const isActive = pgdasStep === s.stepNum;
                  const isCompleted = pgdasStep > s.stepNum;
                  return (
                    <div key={s.stepNum} className="flex items-center group flex-1">
                      {/* Step Item */}
                      <button
                        onClick={() => {
                          if (isCompleted || s.stepNum <= pgdasStep || pgdasFiles.length > 0) {
                            setPgdasStep(s.stepNum as any);
                          } else {
                            addToast(`Por favor, complete a etapa atual para avançar para ${s.label}.`, "info");
                          }
                        }}
                        className={`flex items-center gap-3 transition-all bg-white px-2 ${
                          !isCompleted && s.stepNum > pgdasStep && pgdasFiles.length === 0
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : isActive
                              ? "bg-white text-[#1e2696] border-2 border-[#1e2696]"
                              : "bg-white text-zinc-400 border border-zinc-200 group-hover:border-zinc-300 group-hover:text-zinc-600"
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : s.stepNum}
                        </div>
                        <span
                          className={`text-xs font-bold hidden md:block lg:block transition-all ${
                            isCompleted ? "text-emerald-700" : isActive ? "text-[#1e2696]" : "text-zinc-500 group-hover:text-zinc-700"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span
                          className={`text-xs font-bold md:hidden transition-all ${
                            isCompleted ? "text-emerald-700" : isActive ? "text-[#1e2696]" : "text-zinc-500"
                          }`}
                        >
                          {s.stepNum}. {s.label}
                        </span>
                      </button>
                      
                      {/* Connector Line (Desktop) */}
                      {idx < 4 && (
                        <div className="hidden md:block h-[1px] flex-1 mx-4 transition-all bg-zinc-200">
                          <div className={`h-full transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: IMPORTAÇÃO */}
            {pgdasStep === 1 && (
              <div className="space-y-6">
                
                {/* 1. Dados da apuração Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">1. Dados da apuração</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-9 gap-5">
                    {/* Left Column - Empresa Selection */}
                    <div className="md:col-span-6 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Empresa</label>
                      <div className="relative">
                        <select
                          value={pgdasEmpresaCnpj}
                          onChange={(e) => {
                            setPgdasEmpresaCnpj(e.target.value);
                            const selectedComp = companies.find(c => c.cnpj === e.target.value);
                            if (selectedComp) {
                              setPgdasEmpresaName(selectedComp.razaoSocial);
                            } else if (e.target.value === "53.855.322/0001-95") {
                              setPgdasEmpresaName("NAIALE AUGUSTINHO CONTABILIDADE LTDA");
                            }
                          }}
                          className="w-full pl-3 pr-10 py-2.5 border border-zinc-200 bg-white text-zinc-800 text-xs font-bold rounded-lg focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696] appearance-none"
                        >
                          <option value="53.855.322/0001-95">NAIALE AUGUSTINHO CONTABILIDADE LTDA</option>
                          {companies.map(c => (
                            <option key={c.cnpj} value={c.cnpj}>{c.razaoSocial}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Middle Column - Competência */}
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Competência</label>
                      <div className="relative">
                        <input
                          type="month"
                          value={pgdasCompetencia}
                          onChange={(e) => setPgdasCompetencia(e.target.value)}
                          className="w-full pl-3 pr-3 py-2.5 border border-zinc-200 bg-white text-zinc-800 text-xs font-bold rounded-lg focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Trigger */}
                <input type="file" ref={pgdasFileInputRef} className="hidden" multiple accept=".xml,.zip" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setIsUploadingPgdas(true);
                    setTimeout(() => {
                      setPgdasFiles([
                        { name: "NFE_202606_001.xml", size: "3.2 KB", status: "sucesso" },
                        { name: "NFE_202606_002.xml", size: "4.1 KB", status: "sucesso" },
                        { name: "NFSE_202606_015.xml", size: "2.8 KB", status: "sucesso" }
                      ]);
                      setIsUploadingPgdas(false);
                      addToast("XMLs processados com sucesso!", "success");
                    }, 1200);
                  }
                }} />
                <div 
                  onClick={() => {
                    if (isUploadingPgdas) return;
                    pgdasFileInputRef.current?.click();
                  }}
                  className="border-2 border-dashed border-zinc-200 hover:border-[#1e2696]/60 rounded-2xl p-8 text-center cursor-pointer bg-zinc-50/20 hover:bg-zinc-50/70 transition-all duration-200"
                >
                  {isUploadingPgdas ? (
                    <div className="space-y-3 py-4">
                      <RefreshCw className="h-8 w-8 text-[#1e2696] animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-zinc-800">Processando e Validando XMLs...</p>
                        <p className="text-[10px] text-zinc-400 font-semibold font-mono">Lendo notas e verificando valores...</p>
                      </div>
                      <div className="w-48 bg-zinc-200 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div className="bg-[#1e2696] h-full w-2/3 animate-pulse rounded-full" />
                      </div>
                    </div>
                  ) : pgdasFiles.length > 0 ? (
                    <div className="space-y-4 py-2">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                        <Check className="h-5 w-5" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-zinc-800">Arquivos XML Carregados</p>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Clique para carregar novos arquivos ou atualizar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <Upload className="h-8 w-8 text-[#1e2696] mx-auto" strokeWidth={1.5} />
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1e2696]">
                          Importar XML / ZIP
                        </span>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-1">Arraste ou clique para carregar os XMLs fiscais</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Resumo de Processamento (Only if files uploaded or uploading) */}
                {(isUploadingPgdas || pgdasFiles.length > 0) && (
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                    <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                      <h3 className="text-[13px] font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <span>2. Resumo da Importação</span>
                        {isUploadingPgdas && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </h3>
                    </div>

                    {isUploadingPgdas ? (
                      /* LOADING SKELETON */
                      <div className="space-y-6 animate-pulse">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                              <div className="h-2.5 bg-zinc-200 rounded w-16" />
                              <div className="h-6 bg-zinc-300 rounded w-8" />
                            </div>
                          ))}
                        </div>

                        <div className="overflow-x-auto border border-zinc-100 rounded-xl">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                              <tr className="text-zinc-500 font-bold uppercase">
                                <th className="px-4 py-3"><div className="h-3 bg-zinc-200 rounded w-16" /></th>
                                <th className="px-4 py-3"><div className="h-3 bg-zinc-200 rounded w-10" /></th>
                                <th className="px-4 py-3"><div className="h-3 bg-zinc-200 rounded w-12" /></th>
                                <th className="px-4 py-3"><div className="h-3 bg-zinc-200 rounded w-16" /></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                              <tr>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-200 rounded w-14" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-100 rounded w-6" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-200 rounded w-20" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-100 rounded w-6" /></td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-200 rounded w-10" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-100 rounded w-6" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-300 rounded w-20" /></td>
                                <td className="px-4 py-3"><div className="h-3.5 bg-zinc-100 rounded w-6" /></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                          <div className="space-y-1.5">
                            <div className="h-2.5 bg-zinc-200 rounded w-20" />
                            <div className="h-3.5 bg-zinc-300 rounded w-32" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-2.5 bg-zinc-200 rounded w-16" />
                            <div className="h-3.5 bg-zinc-300 rounded w-24" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ACTUAL CONTENT */
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><FileText className="h-3 w-3" /> XMLs lidos</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">42</p>
                          </div>
                          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><Copy className="h-3 w-3" /> Duplicados</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">0</p>
                          </div>
                          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Rejeitados</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">0</p>
                          </div>
                          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><Trash2 className="h-3 w-3" /> Descartados</p>
                            <p className="text-lg font-black text-zinc-800 mt-1">0</p>
                          </div>
                        </div>

                        {/* Metrics Table */}
                        <div className="overflow-x-auto border border-zinc-100 rounded-xl">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                              <tr className="text-zinc-500 font-bold uppercase">
                                <th className="px-4 py-3">Competência</th>
                                <th className="px-4 py-3">Notas</th>
                                <th className="px-4 py-3">Receita</th>
                                <th className="px-4 py-3">ISS Retido</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-700">
                              <tr>
                                <td className="px-4 py-3 font-semibold">2026-06</td>
                                <td className="px-4 py-3 font-mono text-zinc-500">42</td>
                                <td className="px-4 py-3 font-bold font-mono">R$ 16.067,19</td>
                                <td className="px-4 py-3 font-mono">41</td>
                              </tr>
                              <tr className="bg-zinc-50/50 font-black">
                                <td className="px-4 py-3 text-zinc-900">Total</td>
                                <td className="px-4 py-3">42</td>
                                <td className="px-4 py-3 text-[#1e2696]">R$ 16.467,19</td>
                                <td className="px-4 py-3">-</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Metadata Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                          <div>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase">CNPJ emissor</p>
                            <p className="font-mono font-bold text-zinc-800 mt-0.5">53.855.352/0001-95</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase">Padrão</p>
                            <p className="font-bold text-zinc-800 mt-0.5">NFS-e Nacional</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Navigation CTA at Bottom */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setPgdasStep(1)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-xl border border-zinc-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar ao Contexto
                  </button>
                  <button
                    onClick={() => {
                      if (pgdasFiles.length === 0) {
                        addToast("Por favor, importe os XMLs antes de avançar.", "info");
                      } else {
                        setPgdasStep(2);
                      }
                    }}
                    className="px-6 py-2.5 bg-[#1e2696] text-white hover:bg-[#151c6e] text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                  >
                    Avançar para Dados fiscais <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DADOS FISCAIS */}
            {pgdasStep === 2 && (
              <div className="space-y-6">
                {/* 3. Receitas dos últimos 12 meses */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-zinc-900 tracking-tight">3. Receitas dos últimos 12 meses</h3>
                    <button className="px-3 py-1.5 bg-white text-[#1e2696] hover:bg-zinc-50 text-[11px] font-bold rounded-lg border border-zinc-200 shadow-sm transition-all flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> Buscar receitas na API
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-[11px] font-bold text-zinc-500">RBT12 proporcional</p>
                      <p className="text-xl font-black text-zinc-900 mt-1">R$ 0,00</p>
                    </div>
                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-[11px] font-bold text-zinc-500">Meses considerados</p>
                      <p className="text-xl font-black text-zinc-900 mt-1">1/12</p>
                    </div>
                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-[11px] font-bold text-zinc-500">Fonte atual</p>
                      <p className="text-xl font-black text-zinc-900 mt-1">Manual</p>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 font-semibold">RBT12 proporcional: média dos meses em atividade multiplicada por 12.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                    {[
                      "06/2025", "07/2025", "08/2025", 
                      "09/2025", "10/2025", "11/2025",
                      "12/2025", "01/2026", "02/2026",
                      "03/2026", "04/2026", "05/2026"
                    ].map((month) => (
                      <div key={month} className="flex border border-zinc-200 rounded-lg overflow-hidden focus-within:border-[#1e2696] focus-within:ring-1 focus-within:ring-[#1e2696]/20 transition-all bg-white shadow-xs">
                        <div className="px-3 py-2 flex items-center justify-center min-w-[70px]">
                          <span className="text-[11px] font-semibold text-zinc-500">{month}</span>
                        </div>
                        <input type="text" defaultValue="0,00" className="w-full px-3 py-2 text-[13px] text-zinc-800 outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 4. Receita da competência */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 tracking-tight">4. Receita da competência</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700">Comércio</label>
                      <input type="text" defaultValue="0,00" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696]/20 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700">Serviço Anexo III</label>
                      <input type="text" defaultValue="0,00" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696]/20 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700">Serviço Anexo IV</label>
                      <input type="text" defaultValue="0,00" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696]/20 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700">Serviço Fator R</label>
                      <input type="text" defaultValue="0,00" className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-[#1e2696] focus:ring-1 focus:ring-[#1e2696]/20 transition-all shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-zinc-500">Total da competência</span>
                    <span className="text-lg font-black text-zinc-900">R$ 0,00</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 font-semibold pt-1">O estado sem movimento é definido exclusivamente no resumo principal da apuração.</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setPgdasStep(1)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-xl border border-zinc-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar à Importação
                  </button>
                  <button
                    onClick={() => setPgdasStep(3)}
                    className="px-6 py-2.5 bg-[#1e2696] text-white hover:bg-[#151c6e] text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                  >
                    Avançar para Prévia de Impostos <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PRÉVIA */}
            {pgdasStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                  <div className="border-b border-zinc-100 pb-3">
                    <h3 className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">Simulador de Tributos Simples Nacional (DAS)</h3>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block">Faturamento Acumulado (RBT12)</span>
                      <p className="text-lg font-black text-zinc-800 mt-1">R$ 542.760,00</p>
                      <span className="text-[10px] text-[#1e2696] font-semibold block mt-0.5">Simples Faixa 3</span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block">Alíquota Efetiva Comércio</span>
                      <p className="text-lg font-black text-amber-600 mt-1">4.00%</p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Anexo I da Lei Complementar</span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/50">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block">Alíquota Efetiva Serviços</span>
                      <p className="text-lg font-black text-indigo-600 mt-1">6.00%</p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Anexo III da Lei Complementar</span>
                    </div>
                    <div className="bg-[#1e2696]/[0.02] p-4 rounded-xl border border-[#1e2696]/10">
                      <span className="text-[9px] font-bold text-[#1e2696] uppercase block">Valor Total das Guias DAS</span>
                      <p className="text-lg font-black text-[#1e2696] mt-1">R$ 2.464,80</p>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Guia única consolidada</span>
                    </div>
                  </div>

                  {/* Detailed Tax breakdown table */}
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="bg-zinc-50 p-3 border-b border-zinc-200 text-xs font-extrabold text-zinc-700">
                      Detalhamento do Cálculo dos Impostos
                    </div>
                    <div className="divide-y divide-zinc-200 text-xs text-zinc-700">
                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800">Comércio (Anexo I)</p>
                          <p className="text-[10px] text-zinc-400">Receita Bruta: R$ 12.450,00 | Alíquota nominal: 4.0%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold font-mono text-zinc-900">R$ 498,00</p>
                          <p className="text-[9px] text-zinc-400 font-bold">DAS Comércio</p>
                        </div>
                      </div>

                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800">Prestação de Serviços (Anexo III)</p>
                          <p className="text-[10px] text-zinc-400">Receita Bruta: R$ 32.780,00 | Alíquota nominal: 6.0%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold font-mono text-zinc-900">R$ 1.966,80</p>
                          <p className="text-[9px] text-zinc-400 font-bold">DAS Serviços</p>
                        </div>
                      </div>

                      <div className="p-3.5 flex justify-between items-center bg-[#f0f2fe]/20">
                        <div>
                          <p className="font-black text-[#1e2696]">Consolidado Simples Nacional</p>
                          <p className="text-[10px] text-zinc-500 font-semibold">Valor final calculado para recolhimento</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black font-mono text-[#1e2696]">R$ 2.464,80</p>
                          <p className="text-[9px] text-[#1e2696] font-bold">Soma dos anexos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back / Forward Actions */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setPgdasStep(2)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-xl border border-zinc-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar à Classificação fiscal
                  </button>
                  <button
                    onClick={() => setPgdasStep(4)}
                    className="px-6 py-2.5 bg-[#1e2696] text-white hover:bg-[#151c6e] text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                  >
                    Avançar para Confirmação de Declaração <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMAÇÃO */}
            {pgdasStep === 4 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                  <div className="border-b border-zinc-100 pb-3">
                    <h3 className="text-[13px] font-black text-zinc-900 uppercase tracking-wider">Declaração e Termo de Envio</h3>
                  </div>

                  <div className="p-4 bg-zinc-50/50 rounded-xl border border-zinc-200 space-y-3.5">
                    <p className="text-xs font-bold leading-relaxed text-zinc-700">
                      Ao transmitir esta apuração, você enviará os dados oficiais de faturamento consolidados para a Receita Federal do Brasil através da integração de outorga digital do escritório de contabilidade.
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-zinc-200 text-[11px] font-mono text-zinc-600">
                      <p className="font-extrabold text-zinc-800">Responsável Técnico: NAIALE AUGUSTINHO</p>
                      <p className="mt-1">Escritório Certificado: Contabilidade Alfa Ltda.</p>
                      <p>Protocolo de Chaves: e-CNPJ Escritório Alfa - 45.987.654/0001-32</p>
                    </div>
                  </div>

                  {/* Checklist Section */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-wider">Validações de Segurança Pré-Envio</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Certificado digital válido e ativo",
                        "Competência junho/2026 aberta para transmissão",
                        "XMLs de faturamento sem divergências",
                        "Faturamento acumulado verificado com RBT12",
                      ].map((term, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 bg-white">
                          <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                          <span className="text-[11px] font-bold text-zinc-700">{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back / Submit Actions */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setPgdasStep(3)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-xl border border-zinc-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar à Prévia
                  </button>
                  <button
                    onClick={() => {
                      setIsUploadingPgdas(true);
                      setTimeout(() => {
                        setIsUploadingPgdas(false);
                        setPgdasStep(5);
                        addToast("Declaração PGDAS-D enviada com sucesso!", "success");
                      }, 2500);
                    }}
                    disabled={isUploadingPgdas}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingPgdas ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Transmitindo à Receita Federal...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4" /> Transmitir Declaração Oficial
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: DOCUMENTOS (SUCCESS & FILE DOWNLOAD) */}
            {pgdasStep === 5 && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm text-center space-y-6">
                  {/* Big animated success check */}
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Check className="h-8 w-8 animate-pulse" strokeWidth={2.5} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Apuração Concluída e Transmitida!</h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto font-semibold">
                      Os dados da competência <strong className="text-zinc-800">junho de 2026</strong> foram processados e a declaração oficial está assinada digitalmente.
                    </p>
                  </div>

                  {/* Summary receipt box */}
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 max-w-md mx-auto text-left space-y-3.5 text-xs">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-bold uppercase">
                      <span>Protocolo de Entrega</span>
                      <span className="font-mono text-zinc-600">83D3.2A1D.420F.8789</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2.5 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="font-bold text-zinc-600">Empresa:</span>
                        <span className="font-extrabold text-zinc-800">{pgdasEmpresaName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-zinc-600">CNPJ:</span>
                        <span className="font-mono text-zinc-800">{pgdasEmpresaCnpj}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-zinc-600">DAS Calculado:</span>
                        <span className="font-extrabold font-mono text-emerald-600">R$ 2.464,80</span>
                      </div>
                    </div>
                  </div>

                  {/* Document downloads row */}
                  <div className="space-y-3 max-w-lg mx-auto pt-2">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-left">Arquivos Oficiais Disponíveis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                        onClick={() => addToast("Baixando guia DAS (PDF)...", "success")}
                        className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 hover:border-[#1e2696] rounded-xl hover:shadow-xs transition-all text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-zinc-800">Guia DAS Faturamento</p>
                            <span className="text-[9px] text-zinc-400 block -mt-0.5 font-mono">PDF • 45.2 KB</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>

                      <button 
                        onClick={() => addToast("Baixando Recibo de Entrega (PDF)...", "success")}
                        className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 hover:border-[#1e2696] rounded-xl hover:shadow-xs transition-all text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <FileCheck className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-zinc-800">Recibo de Transmissão</p>
                            <span className="text-[9px] text-zinc-400 block -mt-0.5 font-mono">PDF • 28.1 KB</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>
                  </div>

                  {/* Restart action button */}
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setPgdasFiles([]);
                        setPgdasStep(1);
                        addToast("Nova apuração iniciada.", "info");
                      }}
                      className="px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-black rounded-xl shadow-xs transition-all"
                    >
                      Realizar Nova Apuração
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        
        {/* ====================================================================
            VIEW: CADASTRO DE EMPRESA (EMPRESAS)
            ==================================================================== */}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <span>Empresas</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Cadastro</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">Cadastro de Empresa</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Registre os dados cadastrais essenciais e fiscais do cliente na plataforma.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentPage("empresas")}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 font-bold text-xs transition-colors cursor-pointer text-center h-9 flex items-center justify-center"
                  id="btn-cancelar-cad"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCompanyConfig}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 h-9"
                  id="btn-salvar-empresa-top"
                >
                  <Save className="h-3.5 w-3.5" />
                  Salvar Empresa
                </button>
                <div className="hidden md:block">
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
            <div className="flex justify-end gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage("dashboard")}
                className="px-6 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveCompanyConfig}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-salvar-empresa-bottom"
              >
                <Save className="h-4 w-4" />
                Salvar Empresa
              </button>
            </div>

          </motion.div>
        )}
        </AnimatePresence>

      </main>

    </div>
  );
}
