import { useTranslation } from "react-i18next";
import { C } from "../data/colors";

export default function Privacy() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh";

  if (isZh) return (
    <div className="animate-fu">
      <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.04)" }}>
        <h2 className="font-serif text-[24px] font-bold mb-6" style={{ color: C.ink }}>隐私政策</h2>
        <div className="text-[14px] space-y-4" style={{ color: C.ink + "CC", lineHeight: 2 }}>
          <p><strong style={{ color: C.ink }}>最后更新：2025年6月</strong></p>
          <p>「已读」（yidu.click）尊重并保护你的隐私。本政策说明我们如何收集、使用和保护你的信息。</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>我们收集什么</h3>
          <p>• <strong>你主动提供的内容</strong>：聊天记录文本、截图（用于 AI 分析功能）、生日信息（用于八字/运势）。这些数据仅在分析请求期间传输给 AI 服务商，<strong>我们不存储你提交的任何聊天记录或截图</strong>。</p>
          <p>• <strong>自动收集的信息</strong>：我们使用 Vercel Analytics 收集匿名的页面访问统计（无 Cookie，不追踪个人身份）。</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>我们如何使用数据</h3>
          <p>你提交的文本/图片仅用于生成当次分析结果，传输至第三方 AI 服务（如通义千问、Claude），分析完成后即丢弃。我们的服务器不保留你的聊天内容。</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>第三方服务</h3>
          <p>我们使用以下第三方服务：</p>
          <p>• <strong>AI 分析</strong>：通义千问（阿里云）或 Anthropic Claude，用于处理你的分析请求</p>
          <p>• <strong>托管</strong>：Vercel，用于网站部署和 Serverless 函数</p>
          <p>• <strong>分析</strong>：Vercel Analytics（匿名、无 Cookie）</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>数据安全</h3>
          <p>所有数据传输使用 HTTPS 加密。我们不会出售、交换或以其他方式将你的信息转让给第三方用于营销目的。</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>你的权利</h3>
          <p>由于我们不存储你的个人数据，因此没有需要删除的数据。如有任何隐私相关问题，请通过 GitHub Issues 联系我们。</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>免责声明</h3>
          <p>「已读」提供的所有分析结果仅供娱乐参考，不构成专业心理咨询建议。如有心理健康方面的需要，请寻求专业帮助。</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fu">
      <div className="bg-white rounded-3xl p-7" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.04)" }}>
        <h2 className="font-serif text-[24px] font-bold mb-6" style={{ color: C.ink }}>Privacy Policy</h2>
        <div className="text-[14px] space-y-4" style={{ color: C.ink + "CC", lineHeight: 2 }}>
          <p><strong style={{ color: C.ink }}>Last updated: June 2025</strong></p>
          <p>Yidu (yidu.click) respects and protects your privacy. This policy explains how we collect, use, and safeguard your information.</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>What we collect</h3>
          <p>• <strong>Content you provide</strong>: Chat text, screenshots (for AI analysis), birthday info (for compatibility/fortune features). This data is only transmitted to AI providers during analysis — <strong>we do not store any of your chat logs or screenshots</strong>.</p>
          <p>• <strong>Automatically collected</strong>: We use Vercel Analytics for anonymous page view statistics (no cookies, no personal identification).</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>How we use data</h3>
          <p>Text and images you submit are used solely to generate the current analysis result. They are sent to third-party AI services (Qwen or Claude) and discarded after processing. Our servers do not retain your chat content.</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>Third-party services</h3>
          <p>• <strong>AI analysis</strong>: Qwen (Alibaba Cloud) or Anthropic Claude</p>
          <p>• <strong>Hosting</strong>: Vercel (deployment and serverless functions)</p>
          <p>• <strong>Analytics</strong>: Vercel Analytics (anonymous, cookie-free)</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>Data security</h3>
          <p>All data transmission uses HTTPS encryption. We do not sell, trade, or transfer your information to third parties for marketing purposes.</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>Your rights</h3>
          <p>Since we do not store personal data, there is no data to request deletion of. For privacy questions, please contact us via GitHub Issues.</p>

          <h3 className="font-serif text-[16px] font-bold pt-2" style={{ color: C.ink }}>Disclaimer</h3>
          <p>All analysis results provided by Yidu are for entertainment purposes only and do not constitute professional psychological advice. If you need mental health support, please seek professional help.</p>
        </div>
      </div>
    </div>
  );
}
