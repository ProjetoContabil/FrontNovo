"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  FileKey,
  Shield,
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
  ChevronRight,
  BarChart3,
  Home,
  User,
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
  Receipt
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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
  const [currentPage, setCurrentPage] = useState<"dashboard" | "empresas" | "certificados" | "procuracoes" | "relatorios" | "configuracoes" | "perfil_escritorio">("dashboard");
  const [profileTab, setProfileTab] = useState<"dados" | "responsaveis" | "certificados_integracoes">("dados");
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
    }
  ]);

  const [selectedCompanyCnpj, setSelectedCompanyCnpj] = useState<string>("66.378.843/0001-34");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegime, setFilterRegime] = useState("all");
  const [filterAcesso, setFilterAcesso] = useState("all");

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
  // STATE: CERTIFICADO E PROCURAÇÃO
  // ==========================================
  const [metodoAcesso, setMetodoAcesso] = useState<"certificado" | "procuracao">("certificado");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; lastModified: string } | null>(null);
  const [senhaCertificado, setSenhaCertificado] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [responsavelConfig, setResponsavelConfig] = useState("Naiale Augustinho");
  const [isValidatingCert, setIsValidatingCert] = useState(false);
  const [isValidatedCert, setIsValidatedCert] = useState(false);
  const [validationProgressMessage, setValidationProgressMessage] = useState("");
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
  const isCnpjValid = cnpj.length === 18;
  const isCnpjIncomplete = cnpj.length > 0 && cnpj.length < 18;

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
    setValidationProgressMessage("Decodificando chaves criptográficas .pfx...");
    addToast("Iniciando verificação do certificado digital...", "info");

    setTimeout(() => {
      setValidationProgressMessage("Estabelecendo canal seguro com a Receita Federal...");
      setTimeout(() => {
        setValidationProgressMessage("Autenticando CNPJ com as chaves do SERPRO...");
        setTimeout(() => {
          setIsValidatingCert(false);
          setIsValidatedCert(true);
          
          const expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 1);
          setCertExpiryDate(expDate.toLocaleDateString("pt-BR"));
          addToast("Certificado digital validado e autorizado! ICP-Brasil OK.", "success");
        }, 600);
      }, 600);
    }, 600);
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
    }

    setCurrentPage("dashboard");
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
    
    setCurrentPage("empresas");
    addToast(`Carregando dados de "${company.razaoSocial}" para edição.`, "info");
  };

  const prefillLacunas = () => {
    setCnpj("66.378.843/0001-34");
    addToast("Clique na lupa ao lado do CNPJ para auto-preencher os dados cadastrais.", "info");
  };

  const renderUserDropdown = () => (
    <div className="relative group shrink-0" id="header-user-dropdown">
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl hover:bg-zinc-100/80 transition-all cursor-pointer border border-zinc-200/60 bg-white shadow-xs h-9">
        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
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
                  : "bg-white border-zinc-150 text-zinc-900"
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
            PG
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-zinc-100">PGDAS-D</h1>
            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Plataforma Fiscal Premium</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Profile in Mobile Header */}
          <div className="flex items-center gap-2 p-1 px-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60" id="mobile-header-user">
            <div className="h-6 w-6 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/10">
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
              PG
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-extrabold text-white text-base tracking-tight leading-none font-display">PGDAS-D</h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-0.5">SISTEMA FISCAL</p>
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

          <p className={`text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3 px-2 ${sidebarCollapsed ? "hidden" : "block"}`}>
            Navegação Principal
          </p>
          
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
              {/* Menu Item - Perfil do Escritório (Group Header) */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentPage("perfil_escritorio");
                    setProfileGroupOpen(!profileGroupOpen);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                    currentPage === "perfil_escritorio"
                      ? "bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                      <Briefcase 
                        className={`h-4.5 w-4.5 ${
                          currentPage === "perfil_escritorio" ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
                        }`} 
                        strokeWidth={1.5}
                      />
                    </div>
                    <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                      Perfil do Escritório
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${profileGroupOpen ? "rotate-180" : ""}`} />
                  )}
                </button>

                {/* Submenu Pages */}
                {profileGroupOpen && !sidebarCollapsed && (
                  <div className="pl-4 space-y-1 border-l border-zinc-800 ml-6 py-1">
                    {[
                      { id: "dados", label: "Dados do escritório", icon: Building2 },
                      { id: "responsaveis", label: "Responsável técnico", icon: Shield },
                      { id: "certificados_integracoes", label: "Certificados e integrações", icon: FileKey },
                    ].map((subPage) => {
                      const IconComponent = subPage.icon;
                      const isSubActive = currentPage === "perfil_escritorio" && profileTab === subPage.id;
                      return (
                        <button
                          key={subPage.id}
                          onClick={() => {
                            setCurrentPage("perfil_escritorio");
                            setProfileTab(subPage.id as any);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                            isSubActive
                              ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                          }`}
                        >
                          <IconComponent className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? "text-emerald-400" : "text-zinc-500"}`} />
                          <span className="truncate text-left">{subPage.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Menu Item - Dashboard */}
              <button
                onClick={() => { setCurrentPage("dashboard"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  (currentPage === "dashboard" || currentPage === "empresas")
                    ? "bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
                }`}
                id="nav-empresas-main"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <Building2 
                    className={`h-4.5 w-4.5 ${
                      (currentPage === "dashboard" || currentPage === "empresas") ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
                    }`} 
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                  Empresas Clientes
                </span>
              </button>
              
              {/* Menu Item - Certificados */}
              <button
                onClick={() => { setCurrentPage("certificados"); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-bold ${
                  currentPage === "certificados"
                    ? "bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a]/50"
                }`}
                id="nav-certificados"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200">
                  <Receipt 
                    className={`h-4.5 w-4.5 ${
                      currentPage === "certificados" ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
                    }`} 
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`transition-opacity duration-200 ${sidebarCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "opacity-100"}`}>
                  Módulo Fiscal
                </span>
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
                <div className="absolute top-4 right-4 bg-zinc-900/10 backdrop-blur-md text-zinc-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-zinc-200/20">
                  <Shield className="w-3.5 h-3.5 text-zinc-600" />
                  Painel Administrativo Geral
                </div>
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          escritorioStatus === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          escritorioStatus === "Em implantação" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          escritorioStatus === "Suspenso" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-zinc-100 text-zinc-600 border border-zinc-300"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            escritorioStatus === "Ativo" ? "bg-emerald-500" :
                            escritorioStatus === "Em implantação" ? "bg-blue-500" :
                            escritorioStatus === "Suspenso" ? "bg-amber-500" :
                            "bg-zinc-400"
                          }`}></span>
                          {escritorioStatus}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-500 mt-1.5">{escritorioRazaoSocial}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {/* Admin-only simulation controls to Suspend, Cancel, Reactivate */}
                      <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-[11px] font-bold">
                        <span className="text-zinc-400 px-1 text-[10px] uppercase">Ações do Admin Geral:</span>
                        {escritorioStatus !== "Ativo" && (
                          <button 
                            onClick={() => {
                              setEscritorioStatus("Ativo");
                              addToast("Escritório reativado com sucesso pelo Administrador Geral!", "success");
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Reativar
                          </button>
                        )}
                        {escritorioStatus === "Ativo" && (
                          <button 
                            onClick={() => {
                              setEscritorioStatus("Suspenso");
                              addToast("Escritório suspenso temporariamente por decisão administrativa.", "error");
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Suspender
                          </button>
                        )}
                        {escritorioStatus !== "Cancelado" && (
                          <button 
                            onClick={() => {
                              if (confirm("ATENÇÃO: Deseja realmente cancelar esta conta de escritório? Esta ação é extrema e suspende todos os acessos das empresas.")) {
                                setEscritorioStatus("Cancelado");
                                addToast("Conta do escritório alterada para CANCELADA.", "error");
                              }
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar conta
                          </button>
                        )}
                      </div>

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
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Desde {escritorioDataAbertura}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Header Indicator */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 border border-zinc-200/60 px-6 py-4 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <span>Perfil do Escritório</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-900 font-extrabold font-display bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
                  {[
                    { id: "dados", label: "Dados do Escritório" },
                    { id: "responsaveis", label: "Responsável Técnico" },
                    { id: "certificados_integracoes", label: "Certificados e Integrações" },
                  ].find(t => t.id === profileTab)?.label || "Dados do Escritório"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden md:block">
                Navegue pelas páginas do perfil usando o menu lateral
              </p>
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">

              {/* ABA 1: DADOS CADASTRAIS */}
              {profileTab === "dados" && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-8">
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
                      <Building2 className="w-4 h-4 text-emerald-500" />
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
                    </div>
                  </div>

                  {/* BLOCO 2: ENDEREÇO */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 pb-2">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
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
                      <Mail className="w-4 h-4 text-emerald-500" />
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
                </div>
              )}

              {/* ABA 3: RESPONSÁVEL TÉCNICO */}
              {profileTab === "responsaveis" && (
                <div className="space-y-6">
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
                </div>
              )}


              {/* ABA 6: CERTIFICADOS E INTEGRAÇÕES */}
              {profileTab === "certificados_integracoes" && (





                <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-900">Importação em Lote (Layout de Empresas)</p>
                    <p className="text-[11px] text-zinc-500 font-semibold max-w-md mx-auto">
                      Arraste sua planilha ou arquivo de clientes em formato CSV ou JSON contendo CNPJ, Razão Social e Regime Tributário.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      addToast("Simulando leitura de planilha XLS...", "info");
                      setTimeout(() => {
                        // Add imported simulation
                        setCompanies(prev => [
                          {
                            cnpj: "22.341.984/0001-09",
                            razaoSocial: "TECHNOVA LABS LTDA",
                            nomeFantasia: "TechNova",
                            regimeTributario: "Lucro Real",
                            uf: "SP",
                            municipio: "Campinas",
                            statusAcesso: "Não Configurado",
                            statusPgdas: "Pendente",
                            periodoApuracao: "Junho/2026",
                            statusEmpresa: "Ativa"
                          },
                          ...prev
                        ]);
                        addAuditLog("Importação em lote de empresas", "-", "Importada: TECHNOVA LABS LTDA via arquivo .CSV");
                        addToast("Importação finalizada! Empresa TECHNOVA LABS LTDA adicionada à lista fiscal com sucesso.", "success");
                      }, 1200);
                    }}
                    className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Selecionar Arquivo CSV/JSON
                  </button>
                </div>
              )}

              {/* ABA 6: CERTIFICADOS E INTEGRAÇÕES */}
              {profileTab === "certificados_integracoes" && (
                <div className="space-y-6">
                  {/* ALERTS PREFERENCES AND CRITICAL NOTIFICATIONS */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <FileKey className={`w-4 h-4 ${theme.text}`} />
                        Painel de Certificados Digitais e Alertas de Validade
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Gerencie as chaves criptográficas A1/A3 que realizam as comunicações automatizadas com os fiscos estaduais e federais.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 rounded-2xl border border-zinc-150 p-5 bg-zinc-50/20">
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Lista de Certificados Vinculados</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-zinc-900">E-CNPJ de {escritorioNomeFantasia}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">Tipo: A1 (PFX) · Vínculo Legal</p>
                              <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ICP-Brasil Válido até 10/07/2027
                              </p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200">
                              Ativo (OK)
                            </span>
                          </div>

                          <div className="bg-white border border-rose-100 rounded-xl p-4 flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-zinc-900">E-CNPJ de Procurador (Marta Helena Souza)</p>
                              <p className="text-[10px] text-rose-500 font-bold">Vencimento iminente em 12 dias (23/07/2026)</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">Tipo: A3 (Smartcard) · Válido para 12 empresas</p>
                            </div>
                            <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                              Atenção
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CERTIFICATE UPLOAD FORM */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Adicionar Novo Certificado A1 (.PFX/.P12)</h4>
                        
                        <div 
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={triggerUploadClick}
                          className="border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl p-6 bg-zinc-50/40 text-center cursor-pointer transition-colors space-y-2"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pfx,.p12"
                            className="hidden" 
                          />
                          <div className="mx-auto h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">
                              {uploadedFile ? uploadedFile.name : "Clique ou arraste o certificado aqui"}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                              {uploadedFile ? `${uploadedFile.size} · Carregado` : "Apenas arquivos formato .pfx ou .p12"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Senha do Certificado</label>
                            <input 
                              type="password"
                              value={senhaCertificado}
                              onChange={(e) => setSenhaCertificado(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                              placeholder="Insira a senha"
                            />
                          </div>

                          <div className="space-y-1 flex items-end">
                            <button 
                              onClick={validateCertificate}
                              disabled={isValidatingCert}
                              className={`w-full py-2.5 ${theme.bg} ${theme.hoverBg} text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
                            >
                              {isValidatingCert ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Verificando...
                                </>
                              ) : (
                                "Testar e Importar"
                              )}
                            </button>
                          </div>
                        </div>

                        {isValidatingCert && (
                          <p className="text-[10px] font-bold text-amber-600 animate-pulse bg-amber-50 border border-amber-100 rounded-lg p-2 text-center">
                            {validationProgressMessage}
                          </p>
                        )}

                        {isValidatedCert && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Certificado validado com sucesso! Chave privada armazenada em cofre seguro. Expira em {certExpiryDate}.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CONFIGURAÇÃO DE INTEGRAÇÕES */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                    <div className="border-b border-zinc-100 pb-4">
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${theme.text}`} />
                        Sincronização Fiscal Integrada e Robôs de Leitura
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Sincronize credenciais da Receita, SEFAZ estaduais e municípios. O sistema realiza varredura automática de pendências fiscais em segundo plano.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {integrations.map((integration) => (
                        <div key={integration.id} className="border border-zinc-150 rounded-2xl p-5 bg-white space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">{integration.nome}</h4>
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded ${
                                integration.conexao === "Conectado" 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : integration.conexao === "Não configurado" 
                                  ? "bg-zinc-100 text-zinc-600" 
                                  : "bg-amber-50 text-amber-700 animate-pulse"
                              }`}>
                                {integration.conexao}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">{integration.desc}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-zinc-50 text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const newStatus = integration.status === "Ativo" ? "Inativo" : "Ativo";
                                  setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, status: newStatus } : i));
                                  addAuditLog("Alteração de status de integração", `${integration.nome} (${integration.status})`, `Status: ${newStatus}`);
                                  addToast(`Integração com ${integration.nome} foi ${newStatus === "Ativo" ? "ativada" : "desativada"}!`, "info");
                                }}
                                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                  integration.status === "Ativo" ? "bg-emerald-600" : "bg-zinc-300"
                                }`}
                              >
                                <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${
                                  integration.status === "Ativo" ? "left-5.5" : "left-0.5"
                                }`} />
                              </button>
                              <span className="text-[11px] font-bold text-zinc-500">
                                {integration.status === "Ativo" ? "Ativado" : "Desativado"}
                              </span>
                            </div>

                            <button 
                              onClick={() => {
                                if (integration.conexao === "Não configurado") {
                                  addToast("Configure as credenciais e certificado antes de testar.", "error");
                                  return;
                                }
                                addToast(`Testando canal seguro de comunicação com ${integration.nome}...`, "info");
                                setTimeout(() => {
                                  setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, conexao: "Conectado" } : i));
                                  addToast(`Comunicação restabelecida com ${integration.nome}! 🟢 Servidor Online.`, "success");
                                }, 1200);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold cursor-pointer"
                            >
                              Testar Conexão
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}



              {/* ABA 9: PREFERÊNCIAS E PERSONALIZAÇÃO */}
              {false && (profileTab as any) === "preferencias" && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                  <div className="border-b border-zinc-100 pb-4">
                    <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                      <Settings className={`w-4 h-4 ${theme.text}`} />
                      Personalização da Marca do Escritório e Padrões Fiscais
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Configure a cor de destaque e as variáveis padrão do sistema para agilizar as operações de sua equipe tributária.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* BRANDING ACCENT SELECTOR */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Escolha a Cor Temática do Escritório</h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs font-bold text-zinc-700">
                        {[
                          { key: "emerald", label: "🟢 Esmeralda Fiscal", colorHex: "bg-emerald-600" },
                          { key: "indigo", label: "🔵 Safira Corporativa", colorHex: "bg-indigo-600" },
                          { key: "rose", label: "🔴 Framboesa Moderna", colorHex: "bg-rose-600" },
                          { key: "amber", label: "🟡 Âmbar Energética", colorHex: "bg-amber-600" },
                          { key: "slate", label: "⚫ Grafite Clássico", colorHex: "bg-zinc-700" }
                        ].map((col) => (
                          <button 
                            key={col.key}
                            onClick={() => {
                              setAccentColor(col.key as any);
                              addToast(`Cor temática do escritório alterada para ${col.label.split(" ")[1]}!`, "success");
                            }}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                              accentColor === col.key 
                                ? "border-zinc-900 bg-zinc-50 shadow-md" 
                                : "border-zinc-200 hover:border-zinc-300 bg-white"
                            }`}
                          >
                            <span>{col.label}</span>
                            <span className={`h-4 w-4 rounded-full ${col.colorHex}`} />
                          </button>
                        ))}
                      </div>
                      
                      <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl text-xs font-medium text-zinc-500 leading-relaxed">
                        <strong>Nota:</strong> A cor temática será aplicada instantaneamente nos menus, botões de ação e títulos de todas as abas sob seu controle corporativo.
                      </div>
                    </div>

                    {/* DEFAULTS AND GENERAL SETTINGS */}
                    <div className="space-y-4 text-xs font-semibold text-zinc-700">
                      <h4 className="text-xs font-extrabold text-zinc-900 uppercase">Configuração de Padrões Operacionais</h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Regime Tributário Padrão para Novos Clientes</label>
                          <select 
                            value={defaultRegime}
                            onChange={(e) => setDefaultRegime(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 font-bold text-zinc-700"
                          >
                            <option value="Simples Nacional">Simples Nacional</option>
                            <option value="Lucro Presumido">Lucro Presumido</option>
                            <option value="Lucro Real">Lucro Real</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Estado (UF) Sede Padrão</label>
                          <select 
                            value={defaultUf}
                            onChange={(e) => setDefaultUf(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 font-bold text-zinc-700"
                          >
                            <option value="AL">Maceió - AL (Padrão Sede)</option>
                            <option value="SP">São Paulo - SP</option>
                            <option value="MG">Belo Horizonte - MG</option>
                            <option value="RJ">Rio de Janeiro - RJ</option>
                          </select>
                        </div>

                        <div className="pt-2 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-zinc-900">Relatórios Mensais Automatizados por E-mail</p>
                              <p className="text-[10px] text-zinc-400">Envia resumo compilado de todas as obrigações transmitidas para o administrativo.</p>
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

                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={() => {
                            addAuditLog("Atualização de preferências gerais", "Padrões cadastrais antigos", `Accent: ${accentColor}, Regime: ${defaultRegime}`);
                            addToast("Preferências corporativas e padrões internos salvos com sucesso!", "success");
                          }}
                          className={`px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm`}
                        >
                          Salvar Configurações
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 10: AUDITORIA */}
              {false && (profileTab as any) === "auditoria" && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
                  <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${theme.text}`} />
                        Histórico de Auditoria Geral e Trilha de Auditoria
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Consulte o registro imutável de todas as modificações cadastrais, financeiras, de usuários e certificados do seu inquilino.
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        addToast("Trilha de auditoria exportada em formato Excel criptografado!", "success");
                      }}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Exportar Logs (XLS)
                    </button>
                  </div>

                  <div className="border border-zinc-150 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-black uppercase text-zinc-400">
                          <th className="p-4">Data e Hora</th>
                          <th className="p-4">Operador / Usuário</th>
                          <th className="p-4">Evento / Ação Realizada</th>
                          <th className="p-4">Valor Anterior</th>
                          <th className="p-4">Novo Valor Salvo</th>
                          <th className="p-4">IP e Dispositivo</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-zinc-700 divide-y divide-zinc-50">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-50/50">
                            <td className="p-4 text-zinc-500 font-mono text-[11px] whitespace-nowrap">{log.data}</td>
                            <td className="p-4">
                              <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                {log.usuario}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-zinc-900">{log.evento}</td>
                            <td className="p-4 text-zinc-400 font-medium truncate max-w-[150px]" title={log.valorAnterior}>{log.valorAnterior}</td>
                            <td className="p-4 text-zinc-700 font-bold truncate max-w-[150px]" title={log.valorNovo}>{log.valorNovo}</td>
                            <td className="p-4 text-zinc-500 font-mono text-[10px]">{log.ip} <span className="text-zinc-300">|</span> {log.dispositivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                  onClick={() => setCurrentPage("empresas")}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-zinc-50/50 border border-zinc-200 focus:border-emerald-500 focus:bg-white text-xs font-semibold rounded-xl outline-none transition-all placeholder:text-zinc-400 h-9"
                  />
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <select
                    value={filterRegime}
                    onChange={(e) => setFilterRegime(e.target.value)}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 bg-zinc-50/50 border border-zinc-200 focus:border-emerald-500 text-xs font-bold rounded-xl outline-none cursor-pointer transition-all text-zinc-600 h-9"
                  >
                    <option value="all">Todos os Regimes</option>
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                  </select>
                  <select
                    value={filterAcesso}
                    onChange={(e) => setFilterAcesso(e.target.value)}
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
                    {(() => {
                      const filtered = companies.filter(c => {
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

                      if (filtered.length === 0) {
                        return (
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
                        );
                      }

                      return filtered.map((company, index) => {
                        const initial = company.razaoSocial.charAt(0);
                        return (
                          <tr key={company.cnpj} className="hover:bg-zinc-50/50 transition-colors duration-150">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-500/10 shadow-xs shrink-0">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{company.razaoSocial}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">CNPJ: {company.cnpj}</p>
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
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs transition-all cursor-pointer ${
                                    company.statusAcesso === "Não Configurado"
                                      ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                >
                                  {company.statusAcesso === "Não Configurado" ? "Configurar" : "Gerenciar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
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
                          className="w-full px-3 py-2 border border-zinc-150 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-bold"
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
                          className="w-full px-3 py-2 border border-zinc-150 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-mono font-bold"
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
                          className="w-full px-3 py-2 border border-zinc-150 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-bold"
                        />
                      </div>
                    </div>

                    {/* Progressive live validator loader interface */}
                    <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      {isValidatingCert ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 flex-1">
                          <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin shrink-0" />
                          <span>{validationProgressMessage}</span>
                        </div>
                      ) : isValidatedCert ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 flex-1">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>ICP-Brasil chaves em conformidade. Expiração: {certExpiryDate}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
                          <LockKeyhole className="h-3.5 w-3.5 text-zinc-300" /> Criptografia de ponta a ponta ativa.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={validateCertificate}
                        disabled={isValidatingCert}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer"
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
                  <div key={i} className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 space-y-1">
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
            VIEW: CADASTRO DE EMPRESA (EMPRESAS)
            ==================================================================== */}
        {currentPage === "empresas" && (
          <motion.div
            key="empresas"
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
                  onClick={() => setCurrentPage("dashboard")}
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
                          : isCnpjIncomplete
                          ? "border-rose-400 bg-rose-50/10 focus:ring-rose-500/15 focus:border-rose-500 text-rose-900"
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
                          : isCnpjIncomplete
                          ? "bg-zinc-50 text-zinc-350 border border-zinc-100 cursor-not-allowed"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      }`}
                      id="btn-consultar-cnpj"
                      title={isCnpjIncomplete ? "Preencha o CNPJ completo" : "Consultar na Receita"}
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
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                      <AlertCircle className="h-3 w-3" /> CNPJ incompleto (14 dígitos)
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

            {/* STEP 3: Dados fiscais */}
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
