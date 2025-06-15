import React, { useState, useEffect } from "react";
import { Search, Bot, MessageSquare, Volume2, Loader2, Send, Wand2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { mockVendors, Vendor, predefinedQuestions } from "@/data/mockVendors";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const Index = () => {
  const [keywords, setKeywords] = useState("led lights");
  const [isScraping, setIsScraping] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [query, setQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState("");
  const { toast } = useToast();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const handleScrape = () => {
    if (!keywords) {
      toast({ title: "Please enter keywords", variant: "destructive" });
      return;
    }
    setIsScraping(true);
    setVendors([]);
    toast({ title: "Scraping Alibaba...", description: `Looking for vendors with keywords: "${keywords}"` });
    setTimeout(() => {
      setVendors(mockVendors.map(v => ({...v, status: 'Not Contacted'})));
      setIsScraping(false);
      toast({ title: "Success!", description: `Found ${mockVendors.length} potential vendors.` });
    }, 2000);
  };

  const handleSendMessage = (vendorId: number) => {
    const vendorName = vendors.find(v => v.id === vendorId)?.name || 'the vendor';
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'Messaged' } : v));
    toast({ title: "Message Sent!", description: `Contacting ${vendorName}...` });
    setIsContactDialogOpen(false);

    setTimeout(() => {
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'Responded', reply: "Yes, we can provide CE. Our MOQ is 500 units." } : v));
        toast({ title: "New Reply!", description: `You have a new message from ${vendorName}.` });
    }, 4000);
  };

  const handleQuery = () => {
    if (!query) return;
    setIsQuerying(true);
    setQueryResult("");
    setTimeout(() => {
      let response = "I couldn't find an answer to that.";
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("ce")) {
        const ceVendors = vendors.filter(v => v.certifications.includes("CE")).map(v => v.name);
        if (ceVendors.length > 0) {
          response = `The following suppliers have CE certification: ${ceVendors.join(", ")}.`;
        } else {
          response = "No suppliers with CE certification were found in the current list.";
        }
      } else if (lowerQuery.includes("highest response rate")) {
          const topVendor = vendors.sort((a,b) => b.responseRate - a.responseRate)[0];
          if(topVendor) {
              response = `${topVendor.name} has the highest response rate at ${topVendor.responseRate}%.`;
          }
      }

      setQueryResult(response);
      setIsQuerying(false);
      speak(response);
    }, 1500);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
        toast({ title: "Text-to-speech not supported or no text to speak.", variant: "destructive"});
    }
  };
  
  const getStatusBadgeVariant = (status: Vendor['status']) => {
      switch (status) {
          case 'Not Contacted': return 'outline';
          case 'Messaged': return 'secondary';
          case 'Responded': return 'default';
          case 'Follow-up Sent': return 'default';
      }
  }

  const chartData = vendors.map(vendor => ({ name: vendor.name.split(' ')[0], responseRate: vendor.responseRate }));

  const openContactDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsContactDialogOpen(true);
  };

  const openReplyDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsReplyDialogOpen(true);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Alibaba Insight Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">Your AI-powered sourcing assistant</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/>Define Keywords & Start Scraping</CardTitle>
                <CardDescription>Enter keywords to find vendors on Alibaba.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., custom packaging boxes, wireless chargers..." 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                  />
                  <Button onClick={handleScrape} disabled={isScraping}>
                    {isScraping ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                    Scrape
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
                <CardDescription>
                  {vendors.length > 0 ? `Showing ${vendors.length} potential vendors. Click 'Contact' to send a message.` : "No vendors scraped yet."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor / Product</TableHead>
                      <TableHead>Response Rate</TableHead>
                      <TableHead>Certifications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isScraping && (
                        <TableRow><TableCell colSpan={5} className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/></TableCell></TableRow>
                    )}
                    {!isScraping && vendors.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center p-8 text-muted-foreground">Start by scraping vendors above.</TableCell></TableRow>
                    )}
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.product}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={vendor.responseRate} className="w-20"/>
                            <span>{vendor.responseRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {vendor.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(vendor.status)}>{vendor.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {vendor.status === 'Not Contacted' && (
                            <Button size="sm" onClick={() => openContactDialog(vendor)}>
                              <MessageSquare /> Contact
                            </Button>
                          )}
                          {(vendor.status === 'Messaged' || vendor.status === 'Follow-up Sent') && (
                            <Button size="sm" disabled>
                              <Loader2 className="animate-spin"/> Awaiting
                            </Button>
                          )}
                           {vendor.status === 'Responded' && (
                            <Button size="sm" variant="outline" onClick={() => openReplyDialog(vendor)}>
                              View Reply
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/>Query Engine</CardTitle>
                    <CardDescription>Ask questions about the scraped vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="e.g., Which suppliers have CE certification?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="mb-2"
                    />
                    <Button onClick={handleQuery} disabled={isQuerying || vendors.length === 0} className="w-full">
                        {isQuerying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        Ask AI
                    </Button>
                </CardContent>
                { (isQuerying || queryResult) && (
                    <CardFooter className="flex flex-col items-start gap-3">
                        <div className="font-semibold text-sm">AI Response:</div>
                        {isQuerying && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>}
                        {queryResult && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span>{queryResult}</span>
                                <Button variant="ghost" size="icon" onClick={() => speak(queryResult)} className="h-6 w-6 shrink-0">
                                    <Volume2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                )}
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Vendor Stats</CardTitle>
                    <CardDescription>A quick overview of vendor response rates.</CardDescription>
                </CardHeader>
                <CardContent>
                    {vendors.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{fill: 'hsl(var(--accent))'}}
                                    contentStyle={{
                                        background: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))'
                                    }}
                                />
                                <Bar dataKey="responseRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                            Scrape vendors to see stats.
                        </div>
                    )}
                </CardContent>
              </Card>
          </div>
        </main>
      </div>

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Contact {selectedVendor?.name}</DialogTitle>
                <DialogDescription>
                    This pre-filled message with standard questions will be sent to the vendor.
                </DialogDescription>
            </DialogHeader>
            <Textarea
                readOnly
                value={predefinedQuestions.join("\n")}
                rows={predefinedQuestions.length + 1}
                className="text-sm bg-muted/50"
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => selectedVendor && handleSendMessage(selectedVendor.id)}>
                  <Send /> Send Message
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Reply from {selectedVendor?.name}</DialogTitle>
              </DialogHeader>
              <div className="p-4 bg-muted rounded-md text-sm my-4">
                  <p className="whitespace-pre-wrap">{selectedVendor?.reply}</p>
              </div>
              <DialogFooter>
                  <Button onClick={() => setIsReplyDialogOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
