
export type Vendor = {
  id: number;
  name: string;
  product: string;
  responseRate: number;
  certifications: string[];
  status: 'Not Contacted' | 'Messaged' | 'Responded' | 'Follow-up Sent';
  reply?: string;
  questionsAnswered: { [key: string]: boolean };
};

export const predefinedQuestions = [
    "What is your minimum order quantity (MOQ)?",
    "Can you provide a sample?",
    "What are the payment terms?",
    "What is the lead time for production?",
];

export const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Shenzhen Bright LED Co.",
    product: "High-Lumen LED Strips",
    responseRate: 95,
    certifications: ["CE", "RoHS"],
    status: 'Not Contacted',
    questionsAnswered: {}
  },
  {
    id: 2,
    name: "Guangzhou Power Electronics",
    product: "Industrial Power Supply Units",
    responseRate: 88,
    certifications: ["CE", "FCC", "UL"],
    status: 'Not Contacted',
    questionsAnswered: {}
  },
  {
    id: 3,
    name: "Yiwu Creative Packaging",
    product: "Custom Branded Gift Boxes",
    responseRate: 99,
    certifications: ["FSC"],
    status: 'Not Contacted',
    questionsAnswered: {}
  },
  {
    id: 4,
    name: "Hangzhou Silk Fabrics Ltd.",
    product: "100% Mulberry Silk",
    responseRate: 92,
    certifications: ["OEKO-TEX"],
    status: 'Not Contacted',
    questionsAnswered: {}
  },
  {
    id: 5,
    name: "Dongguan Precision Hardware",
    product: "CNC Machined Aluminum Parts",
    responseRate: 97,
    certifications: ["ISO 9001"],
    status: 'Not Contacted',
    questionsAnswered: {}
  },
];
