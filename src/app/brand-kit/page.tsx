"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, FileText, Image, Palette, Type, Layout, MessageSquare } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/navigation";

export default function BrandKit() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("strategy");

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const tabs = [
    { id: "strategy", label: "Strategy", icon: FileText },
    { id: "logo", label: "Logo", icon: Image },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "components", label: "Components", icon: Layout },
    { id: "voice", label: "Voice & Tone", icon: MessageSquare },
  ];

  const primaryColors = [
    { name: "Primary Deep Blue", hex: "#1a365d", hsl: "210 55% 23%", rgb: "26, 54, 93", role: "Primary actions, links, text on light backgrounds" },
    { name: "Primary Steel Blue", hex: "#4682b4", hsl: "207 44% 49%", rgb: "70, 130, 180", role: "Beams effect, accents, focus rings" },
    { name: "Secondary Cyan", hex: "#3fb9ff", hsl: "199 100% 62%", rgb: "63, 185, 255", role: "Primary CTAs, buttons, highlights" },
  ];

  const backgroundColorsLight = [
    { name: "Background White", hex: "#ffffff", hsl: "0 0% 100%", rgb: "255, 255, 255", role: "Products, Value, Features sections" },
    { name: "Card White", hex: "#ffffff", hsl: "0 0% 100%", rgb: "255, 255, 255", role: "Cards on light backgrounds" },
    { name: "Muted Light", hex: "#f5f7fa", hsl: "210 10% 96%", rgb: "245, 247, 250", role: "Subtle background variations" },
  ];

  const backgroundColorsDark = [
    { name: "Background Navy", hex: "#001f3f", hsl: "210 100% 12%", rgb: "0, 31, 63", role: "Dark section backgrounds" },
    { name: "Card Charcoal", hex: "#2a3a4a", hsl: "210 16% 18%", rgb: "42, 58, 74", role: "Cards on dark backgrounds" },
    { name: "Muted Dark", hex: "#2d3a45", hsl: "210 16% 22%", rgb: "45, 58, 69", role: "Secondary dark backgrounds" },
  ];

  const gradients = [
    { name: "Hero Gradient", css: "linear-gradient(180deg, #0f2744 0%, #1a3a5c 30%, #2a5070 60%, #3d6585 100%)", usage: "Hero section background" },
    { name: "Primary Gradient", css: "linear-gradient(135deg, #1a365d 0%, #4682b4 100%)", usage: "CTA highlights, accents" },
    { name: "Background Gradient", css: "linear-gradient(180deg, #001f3f 0%, #3d4a55 100%)", usage: "Dark section depth" },
  ];

  const typeScale = [
    { level: "Display", size: "4.5rem / 72px", classes: "text-7xl", usage: "Hero headlines" },
    { level: "H1", size: "3rem / 48px", classes: "text-5xl", usage: "Page titles" },
    { level: "H2", size: "2.25rem / 36px", classes: "text-4xl", usage: "Section headings" },
    { level: "H3", size: "1.5rem / 24px", classes: "text-2xl", usage: "Subsections" },
    { level: "Body", size: "1rem / 16px", classes: "text-base", usage: "Paragraph text" },
    { level: "Small", size: "0.875rem / 14px", classes: "text-sm", usage: "Captions, labels" },
  ];

  const fontWeights = [
    { name: "Light", value: "300", usage: "Subtle text, captions" },
    { name: "Regular", value: "400", usage: "Body text, paragraphs" },
    { name: "Medium", value: "500", usage: "Labels, navigation" },
    { name: "Semibold", value: "600", usage: "Subheadings, emphasis" },
    { name: "Bold", value: "700", usage: "Headings, titles" },
  ];

  const ColorSwatch = ({ color }: { color: any }) => (
    <Card className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
      <div className="h-20" style={{ backgroundColor: color.hex }}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">{color.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(color.hex, color.name)}
            className="h-7 px-2"
          >
            {copiedColor === color.name ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 font-mono">HEX: {color.hex}</p>
        <p className="text-xs text-gray-500 font-mono">HSL: {color.hsl}</p>
        <p className="text-xs text-gray-400 mt-2">{color.role}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Navigation customNavItems={[
        { id: "home", label: "Home", href: "/", isLink: true },
        { id: "brand-kit", label: "Brand Kit", href: "/brand-kit", isLink: true },
      ]} />

      <header style={{ background: 'linear-gradient(180deg, #0f2744 0%, #1a3a5c 30%, #2a5070 60%, #3d6585 100%)' }} className="text-white pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl transform rotate-45"></div>
          <div className="absolute bottom-0 left-40 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Brand Kit</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything you need to represent Ads by Dovito consistently across all touchpoints.
          </p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#3fb9ff]/10 text-[#3fb9ff]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === "strategy" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Brand Strategy & Essence</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-[#3fb9ff] font-semibold mb-3">Mission Statement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To provide local Main Street Windsor businesses with premium digital advertising, helping them reach thousands of potential customers through strategic display placement.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-[#3fb9ff] font-semibold mb-3">Vision Statement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become the leading local advertising platform for Main Street businesses, creating a vibrant and connected community through visible, professional advertising.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-[#3fb9ff] font-semibold mb-4">Core Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Local Community First", "Transparency", "Reliability", "Accessibility"].map((value) => (
                  <Card key={value} className="bg-white rounded-2xl border-0 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-gray-900">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-3">Brand Personality</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-gray-600 space-y-2">
                    <li>Confident yet friendly</li>
                    <li>Professional with approachable expertise</li>
                  </ul>
                  <ul className="text-gray-600 space-y-2">
                    <li>Results-driven but empowering</li>
                    <li>Modern and forward-thinking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-3">Positioning Statement</h3>
                <p className="text-gray-600 leading-relaxed">
                  For local Windsor businesses who want to increase visibility, Ads by Dovito is the premium digital advertising platform that delivers thousands of impressions through strategically placed Main Street displays, unlike traditional print or online ads that get lost in the noise.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "logo" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Logo & Marks</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
                <div className="p-8 flex items-center justify-center min-h-[200px]">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #4682b4 100%)' }}>
                      <span className="text-white text-xl font-bold">D</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1a365d]">Ads by Dovito</span>
                  </div>
                </div>
                <div className="px-8 pb-6 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">Primary Logo - Light Background</p>
                </div>
              </Card>

              <Card className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
                <div className="p-8 flex items-center justify-center min-h-[200px]" style={{ backgroundColor: '#001f3f' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-[#1a365d] text-xl font-bold">D</span>
                    </div>
                    <span className="text-2xl font-bold text-white">Ads by Dovito</span>
                  </div>
                </div>
                <div className="px-8 pb-6 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">Primary Logo - Dark Background</p>
                </div>
              </Card>
            </div>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-4">Logo Usage Guidelines</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Do's</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>Maintain minimum clear space equal to the height of the "D" icon</li>
                      <li>Use approved color combinations only</li>
                      <li>Ensure adequate contrast with backgrounds</li>
                      <li>Scale proportionally</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Don'ts</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>Don't stretch or distort the logo</li>
                      <li>Don't change the colors</li>
                      <li>Don't add effects (shadows, gradients, outlines)</li>
                      <li>Don't place on busy backgrounds without contrast</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "colors" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Color System</h2>

            <div>
              <h3 className="text-[#3fb9ff] font-semibold mb-4">Primary Colors</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {primaryColors.map((color) => <ColorSwatch key={color.name} color={color} />)}
              </div>
            </div>

            <div>
              <h3 className="text-[#3fb9ff] font-semibold mb-4">Background Colors - Light Mode</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {backgroundColorsLight.map((color) => <ColorSwatch key={color.name} color={color} />)}
              </div>
            </div>

            <div>
              <h3 className="text-[#3fb9ff] font-semibold mb-4">Background Colors - Dark Mode</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {backgroundColorsDark.map((color) => <ColorSwatch key={color.name} color={color} />)}
              </div>
            </div>

            <div>
              <h3 className="text-[#3fb9ff] font-semibold mb-4">Gradients</h3>
              <div className="space-y-4">
                {gradients.map((gradient) => (
                  <Card key={gradient.name} className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
                    <div className="h-24" style={{ background: gradient.css }}></div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{gradient.name}</h4>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded mb-2 overflow-x-auto">
                        {gradient.css}
                      </p>
                      <p className="text-xs text-gray-400">{gradient.usage}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "typography" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Typography</h2>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-4">Font Family</h3>
                <p className="text-gray-600 mb-2"><strong>Primary:</strong> Inter</p>
                <p className="text-gray-600 mb-4"><strong>Fallbacks:</strong> system-ui, -apple-system, sans-serif</p>
                <p className="text-sm text-gray-500 font-mono bg-gray-100 p-3 rounded">
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-6">Type Scale</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-900">Level</th>
                        <th className="text-left p-3 font-semibold text-gray-900">Size</th>
                        <th className="text-left p-3 font-semibold text-gray-900">Classes</th>
                        <th className="text-left p-3 font-semibold text-gray-900">Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeScale.map((row, idx) => (
                        <tr key={row.level} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="p-3 font-medium">{row.level}</td>
                          <td className="p-3 text-gray-600 font-mono text-xs">{row.size}</td>
                          <td className="p-3 text-gray-600 font-mono text-xs">{row.classes}</td>
                          <td className="p-3 text-gray-500">{row.usage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-4">Font Weights</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {fontWeights.map((weight) => (
                    <div key={weight.name} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 mb-1" style={{ fontWeight: parseInt(weight.value) }}>{weight.name}</p>
                      <p className="text-xs text-gray-500">{weight.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{weight.usage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "components" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Components</h2>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-6">Buttons</h3>
                <div className="flex items-center gap-4 flex-wrap mb-6">
                  <Button className="bg-[#3fb9ff] hover:bg-[#3fb9ff]/90 text-white rounded-full px-6">Primary CTA</Button>
                  <Button variant="outline" className="border-[#1a365d] text-[#1a365d] rounded-full px-6">Secondary</Button>
                  <Button variant="ghost" className="text-[#1a365d] rounded-full px-6">Ghost</Button>
                  <Button className="bg-white text-[#1a365d] hover:bg-gray-100 border border-gray-200 rounded-full px-6">Inverted</Button>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Primary CTA:</strong> bg-[#3fb9ff] - Maximum visibility for main actions</p>
                  <p><strong>Secondary:</strong> Outline style - For secondary actions</p>
                  <p><strong>Inverted:</strong> White background - Used on dark/gradient backgrounds</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-6">Cards</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border shadow-sm rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Standard Card</p>
                      <p className="text-xs text-gray-400">border, shadow-sm, rounded-2xl</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0 rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Muted Card</p>
                      <p className="text-xs text-gray-400">bg-gray-50, no border</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-[#3fb9ff] rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Featured Card</p>
                      <p className="text-xs text-gray-400">border-2 border-cyan</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-4">Border Radius</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3fb9ff] rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">rounded-lg</p>
                    <p className="text-xs text-gray-400">0.5rem</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3fb9ff] rounded-xl mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">rounded-xl</p>
                    <p className="text-xs text-gray-400">0.75rem</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3fb9ff] rounded-2xl mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">rounded-2xl</p>
                    <p className="text-xs text-gray-400">1rem</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3fb9ff] rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">rounded-full</p>
                    <p className="text-xs text-gray-400">9999px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "voice" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Voice & Tone</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-[#3fb9ff] font-semibold mb-4">Tone Guidelines</h3>
                  <ul className="text-gray-600 space-y-3">
                    <li><strong>Confident yet friendly</strong> - Expertise without arrogance</li>
                    <li><strong>Clear and concise</strong> - Direct language that respects time</li>
                    <li><strong>Results-focused</strong> - Always tie features to outcomes</li>
                    <li><strong>Empowering</strong> - Enable action, don't overwhelm</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-[#3fb9ff] font-semibold mb-4">Example Messaging</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">Tagline:</p>
                      <p className="text-gray-600">"Get Your Business Seen on Main Street Windsor"</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Example CTAs:</p>
                      <p className="text-gray-600">"Start Application" / "Get Started" / "See Live Display"</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Value Props:</p>
                      <p className="text-gray-600">"7,600+ monthly views" / "16 hours daily" / "24-hour review"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-[#3fb9ff] font-semibold mb-4">Writing Style</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Do</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>Use active voice</li>
                      <li>Keep sentences short and punchy</li>
                      <li>Focus on benefits, not features</li>
                      <li>Use numbers and specifics when possible</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Don't</h4>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>Use jargon or buzzwords</li>
                      <li>Make exaggerated claims</li>
                      <li>Be overly formal or stiff</li>
                      <li>Use passive voice unnecessarily</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="text-white py-8" style={{ backgroundColor: '#001f3f' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">2025 Ads by Dovito. All brand assets are property of Ads by Dovito.</p>
        </div>
      </footer>
    </div>
  );
}
