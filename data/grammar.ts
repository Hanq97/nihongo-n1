import type { Grammar } from "@/types";

// N1 grammar — curated (~60 patterns). For full ~250 patterns, import via JSON.
export const SEED_GRAMMAR: Grammar[] = [
  {
    id: 1, pattern: "～にもかかわらず", meaning_vi: "mặc dù ~, dù cho ~",
    usage: "Diễn tả sự việc ngược lại với điều được kỳ vọng từ vế trước. Dùng với danh từ, V普通形, A普通形.",
    examples: [
      { jp: "雨にもかかわらず、試合は行われた。", vi: "Mặc dù trời mưa, trận đấu vẫn diễn ra." },
      { jp: "努力したにもかかわらず、失敗した。", vi: "Mặc dù đã nỗ lực nhưng vẫn thất bại." },
    ],
    category: "Nghịch lý / Trái ngược",
  },
  {
    id: 2, pattern: "～ざるを得ない", meaning_vi: "buộc phải, không thể không ~",
    usage: "Diễn tả sự buộc phải làm gì đó dù không muốn. V未然形 + ざるを得ない. Đặc biệt: する → せざるを得ない.",
    examples: [
      { jp: "上司の命令だから従わざるを得ない。", vi: "Vì là mệnh lệnh của cấp trên nên buộc phải tuân theo." },
      { jp: "状況を考えると、断念せざるを得ない。", vi: "Xét tình hình, không thể không từ bỏ." },
    ],
    category: "Bắt buộc",
  },
  {
    id: 3, pattern: "～かのようだ", meaning_vi: "như thể là ~",
    usage: "Diễn tả sự so sánh, ví von điều gì đó như thể nó là thật. V普通形 / N + であるかのようだ.",
    examples: [
      { jp: "彼はすべてを知っているかのように話す。", vi: "Anh ấy nói như thể biết tất cả." },
      { jp: "彼女は天使であるかのように微笑んだ。", vi: "Cô ấy mỉm cười như thể là một thiên thần." },
    ],
    category: "So sánh",
  },
  {
    id: 4, pattern: "～を余儀なくされる", meaning_vi: "bị buộc phải ~ (không còn lựa chọn)",
    usage: "Diễn tả việc bị buộc phải làm điều gì đó do hoàn cảnh ngoài ý muốn. N + を余儀なくされる.",
    examples: [
      { jp: "台風で旅行の中止を余儀なくされた。", vi: "Vì bão nên buộc phải hủy chuyến đi." },
      { jp: "経営難で閉店を余儀なくされた。", vi: "Vì khó khăn kinh doanh, buộc phải đóng cửa hàng." },
    ],
    category: "Bắt buộc",
  },
  {
    id: 5, pattern: "～たところで", meaning_vi: "dù có ~ cũng (không/vô ích)",
    usage: "Diễn tả dù có làm gì đó cũng không đạt được kết quả mong muốn. Vた + ところで.",
    examples: [
      { jp: "今さら謝ったところで、彼は許してくれないだろう。", vi: "Bây giờ dù có xin lỗi anh ấy cũng không tha thứ đâu." },
      { jp: "急いだところで、間に合わない。", vi: "Dù có vội cũng không kịp." },
    ],
    category: "Giả định / Vô ích",
  },
  {
    id: 6, pattern: "～がてら", meaning_vi: "nhân tiện ~, kết hợp ~",
    usage: "Diễn tả việc làm thêm điều gì đó trong khi đang làm việc chính. N / Vます + がてら.",
    examples: [
      { jp: "散歩がてら買い物に行った。", vi: "Nhân tiện đi dạo thì đi mua sắm luôn." },
      { jp: "見舞いがてら花を届ける。", vi: "Tiện thăm bệnh thì mang hoa đến luôn." },
    ],
    category: "Đồng thời",
  },
  {
    id: 7, pattern: "～や否や", meaning_vi: "ngay khi ~",
    usage: "Diễn tả ngay sau khi sự việc trước xảy ra thì sự việc sau lập tức xảy ra. V辞書形 + や否や.",
    examples: [
      { jp: "彼は家に着くや否や、ベッドに倒れ込んだ。", vi: "Ngay khi về đến nhà, anh ấy đổ sập xuống giường." },
      { jp: "ベルが鳴るや否や、学生たちは教室を飛び出した。", vi: "Ngay khi chuông reo, học sinh lao ra khỏi lớp." },
    ],
    category: "Thời gian",
  },
  {
    id: 8, pattern: "～ともなると", meaning_vi: "khi đến mức ~, đã là ~ thì",
    usage: "Diễn tả khi đến một mức độ/vị trí nào đó thì sẽ có tình huống khác trước. N + ともなると.",
    examples: [
      { jp: "社長ともなると、責任が重い。", vi: "Đã là giám đốc thì trách nhiệm rất nặng." },
      { jp: "大学生ともなると、親に頼れない。", vi: "Đã là sinh viên đại học thì không thể dựa vào bố mẹ." },
    ],
    category: "Mức độ",
  },
  {
    id: 9, pattern: "～まじき", meaning_vi: "không thể (chấp nhận) được",
    usage: "Diễn tả điều không thể chấp nhận được theo chuẩn mực, đạo đức. V辞書形 + まじき + N. Văn viết, trang trọng.",
    examples: [
      { jp: "教師にあるまじき行為だ。", vi: "Hành vi không thể chấp nhận được của một giáo viên." },
      { jp: "言うまじきことを言ってしまった。", vi: "Đã lỡ nói ra điều không nên nói." },
    ],
    category: "Phán đoán",
  },
  {
    id: 10, pattern: "～にひきかえ", meaning_vi: "ngược lại với ~",
    usage: "Diễn tả sự đối lập rõ rệt giữa hai sự vật/hiện tượng. N + にひきかえ.",
    examples: [
      { jp: "兄は社交的なのにひきかえ、弟は内向的だ。", vi: "Ngược lại với người anh hòa đồng, em trai lại sống nội tâm." },
      { jp: "去年の不景気にひきかえ、今年は好調だ。", vi: "Trái ngược với suy thoái năm ngoái, năm nay rất khả quan." },
    ],
    category: "Tương phản",
  },
  {
    id: 11, pattern: "～ばこそ", meaning_vi: "chính vì ~ nên",
    usage: "Nhấn mạnh lý do. V/A仮定形 + ばこそ.",
    examples: [
      { jp: "あなたを愛していればこそ、厳しく言うのです。", vi: "Chính vì yêu bạn nên tôi mới nói nghiêm khắc." },
      { jp: "健康であればこそ、何でもできる。", vi: "Chính vì khỏe mạnh nên mới làm được mọi thứ." },
    ],
    category: "Lý do",
  },
  {
    id: 12, pattern: "～たりとも", meaning_vi: "dù chỉ ~, không một (chút) nào",
    usage: "Phủ định triệt để. Số từ + たりとも + phủ định.",
    examples: [
      { jp: "一刻たりとも油断できない。", vi: "Không thể lơ là dù chỉ một khoảnh khắc." },
      { jp: "一円たりとも無駄にしない。", vi: "Không lãng phí dù chỉ một yên." },
    ],
    category: "Phủ định nhấn mạnh",
  },
  {
    id: 13, pattern: "～ものを", meaning_vi: "đáng lẽ ~ thế mà...",
    usage: "Bày tỏ sự tiếc nuối, trách cứ. V/Aの普通形 + ものを.",
    examples: [
      { jp: "早く言えばよかったものを。", vi: "Đáng lẽ phải nói sớm hơn." },
      { jp: "謝れば許したものを。", vi: "Nếu xin lỗi thì đã được tha rồi." },
    ],
    category: "Hối tiếc",
  },
  {
    id: 14, pattern: "～始末だ", meaning_vi: "rốt cuộc lại ~ (kết quả xấu)",
    usage: "Diễn tả kết cục xấu sau quá trình. V辞書形 + 始末だ.",
    examples: [
      { jp: "彼は遅刻するばかりか、無断欠勤する始末だ。", vi: "Anh ta không chỉ đi muộn mà rốt cuộc còn nghỉ không phép." },
      { jp: "言い争いから喧嘩になる始末だ。", vi: "Từ cãi vã rồi rốt cuộc thành đánh nhau." },
    ],
    category: "Kết cục",
  },
  {
    id: 15, pattern: "～かたわら", meaning_vi: "song song với ~",
    usage: "Diễn tả làm hai việc song song. V辞書形 / Nの + かたわら.",
    examples: [
      { jp: "仕事のかたわら小説を書いている。", vi: "Bên cạnh công việc, đang viết tiểu thuyết." },
      { jp: "勉強するかたわらアルバイトもしている。", vi: "Vừa học vừa làm thêm." },
    ],
    category: "Đồng thời",
  },
  {
    id: 16, pattern: "～がはやいか", meaning_vi: "vừa mới ~ thì",
    usage: "Hành động ngay sau khi sự việc trước xảy ra. V辞書形 + が早いか.",
    examples: [
      { jp: "席に着くがはやいか食べ始めた。", vi: "Vừa ngồi vào chỗ là đã bắt đầu ăn." },
      { jp: "彼はベルが鳴るがはやいか教室を出て行った。", vi: "Chuông vừa reo anh ấy đã ra khỏi lớp." },
    ],
    category: "Thời gian",
  },
  {
    id: 17, pattern: "～なり", meaning_vi: "ngay khi ~ thì lập tức",
    usage: "Hành động sau ngay khi hành động trước kết thúc. V辞書形 + なり.",
    examples: [
      { jp: "彼は家に帰るなり泣き出した。", vi: "Anh ấy về đến nhà là khóc òa." },
      { jp: "見るなり驚いた。", vi: "Vừa nhìn thấy là kinh ngạc." },
    ],
    category: "Thời gian",
  },
  {
    id: 18, pattern: "～そばから", meaning_vi: "vừa mới ~ đã ngay (lặp lại)",
    usage: "Hành động bị phá vỡ ngay sau khi vừa làm. V辞書形/Vたら/Vば + そばから.",
    examples: [
      { jp: "覚えるそばから忘れてしまう。", vi: "Vừa nhớ xong đã quên ngay." },
      { jp: "片付けるそばから散らかされる。", vi: "Vừa dọn xong lại bị làm bừa.", },
    ],
    category: "Thời gian / Lặp lại",
  },
  {
    id: 19, pattern: "～を皮切りに", meaning_vi: "bắt đầu từ ~",
    usage: "Bắt đầu một loạt sự việc. N + を皮切りに/として.",
    examples: [
      { jp: "東京を皮切りに、全国でコンサートを行う。", vi: "Bắt đầu từ Tokyo, tổ chức concert toàn quốc." },
      { jp: "彼の発言を皮切りに議論が始まった。", vi: "Bắt đầu từ phát ngôn của anh ấy, tranh luận nổ ra." },
    ],
    category: "Khởi điểm",
  },
  {
    id: 20, pattern: "～を踏まえて", meaning_vi: "dựa trên ~, căn cứ vào ~",
    usage: "Dựa trên cơ sở nào đó. N + を踏まえて.",
    examples: [
      { jp: "結果を踏まえて対策を立てる。", vi: "Căn cứ kết quả để lập đối sách." },
      { jp: "現状を踏まえて判断する。", vi: "Dựa trên hiện trạng để phán đoán." },
    ],
    category: "Căn cứ",
  },
  {
    id: 21, pattern: "～にあって", meaning_vi: "trong (tình huống/hoàn cảnh) ~",
    usage: "Trong hoàn cảnh đặc biệt. N + にあって.",
    examples: [
      { jp: "戦時にあっても希望を失わなかった。", vi: "Ngay trong thời chiến cũng không mất hi vọng." },
      { jp: "苦境にあっても努力を続けた。", vi: "Dù trong cảnh khó khăn vẫn tiếp tục cố gắng." },
    ],
    category: "Hoàn cảnh",
  },
  {
    id: 22, pattern: "～いかんによらず", meaning_vi: "bất kể ~",
    usage: "Không phụ thuộc vào điều gì đó. N + いかんによらず/にかかわらず.",
    examples: [
      { jp: "理由のいかんによらず、暴力は許されない。", vi: "Bất kể lý do gì, bạo lực không được tha thứ." },
      { jp: "結果のいかんによらず、挑戦に意味がある。", vi: "Bất kể kết quả ra sao, thử thách vẫn có ý nghĩa." },
    ],
    category: "Bất kể",
  },
  {
    id: 23, pattern: "～をものともせず", meaning_vi: "bất chấp ~",
    usage: "Không sợ khó khăn. N + をものともせず(に).",
    examples: [
      { jp: "悪天候をものともせず出発した。", vi: "Bất chấp thời tiết xấu vẫn lên đường." },
      { jp: "反対をものともせず計画を進めた。", vi: "Bất chấp phản đối vẫn tiến hành kế hoạch." },
    ],
    category: "Bất chấp",
  },
  {
    id: 24, pattern: "～をよそに", meaning_vi: "mặc kệ ~, bỏ ngoài tai ~",
    usage: "Không quan tâm điều gì đó. N + をよそに.",
    examples: [
      { jp: "親の心配をよそに遊んでいる。", vi: "Mặc kệ bố mẹ lo lắng, vẫn chơi." },
      { jp: "批判をよそに政策を進めた。", vi: "Bỏ ngoài tai phê bình, vẫn xúc tiến chính sách." },
    ],
    category: "Mặc kệ",
  },
  {
    id: 25, pattern: "～ともなしに", meaning_vi: "vô tình ~, không chủ đích",
    usage: "Hành động không có ý thức. V辞書形 + ともなしに/ともなく.",
    examples: [
      { jp: "見るともなしにテレビを見ていた。", vi: "Đang xem TV mà không thực sự xem." },
      { jp: "聞くともなしに話を聞いていた。", vi: "Đang nghe mà không tập trung." },
    ],
    category: "Vô ý thức",
  },
  {
    id: 26, pattern: "～ながらに", meaning_vi: "vừa ~ vừa, trong tình trạng ~",
    usage: "Ở trạng thái hiện tại của một điều. N/Vます + ながらに(して).",
    examples: [
      { jp: "涙ながらに語った。", vi: "Vừa khóc vừa kể." },
      { jp: "家にいながらにして買い物ができる。", vi: "Ở nhà cũng có thể mua sắm." },
    ],
    category: "Trạng thái",
  },
  {
    id: 27, pattern: "～きらいがある", meaning_vi: "có khuynh hướng ~ (tiêu cực)",
    usage: "Có xu hướng xấu nào đó. V辞書形/Nの + きらいがある.",
    examples: [
      { jp: "彼は感情的になるきらいがある。", vi: "Anh ấy có khuynh hướng dễ xúc động." },
      { jp: "近頃の若者は本を読まないきらいがある。", vi: "Người trẻ gần đây có xu hướng không đọc sách." },
    ],
    category: "Khuynh hướng",
  },
  {
    id: 28, pattern: "～ずくめ", meaning_vi: "toàn ~, đầy ~",
    usage: "Đầy thứ gì đó. N + ずくめ.",
    examples: [
      { jp: "黒ずくめの服装。", vi: "Trang phục toàn màu đen." },
      { jp: "今日はいいことずくめだ。", vi: "Hôm nay toàn chuyện vui." },
    ],
    category: "Toàn bộ",
  },
  {
    id: 29, pattern: "～めく", meaning_vi: "có vẻ ~, giống ~",
    usage: "Có vẻ giống. N + めく.",
    examples: [
      { jp: "皮肉めいた言い方。", vi: "Cách nói có vẻ châm biếm." },
      { jp: "春めいてきた。", vi: "Đã có hơi hướng mùa xuân." },
    ],
    category: "Giống như",
  },
  {
    id: 30, pattern: "～にたえる／にたえない", meaning_vi: "có thể chịu được/không thể chịu được",
    usage: "Đáng/không đáng làm gì đó. N + にたえる/にたえない.",
    examples: [
      { jp: "鑑賞にたえる作品。", vi: "Tác phẩm đáng thưởng thức." },
      { jp: "見るにたえない光景。", vi: "Cảnh tượng không nỡ nhìn." },
    ],
    category: "Đáng giá",
  },
  {
    id: 31, pattern: "～にかたくない", meaning_vi: "không khó để ~",
    usage: "Dễ tưởng tượng/hiểu. N(想像/察し) + にかたくない.",
    examples: [
      { jp: "彼の気持ちは想像にかたくない。", vi: "Không khó để hình dung cảm xúc của anh ấy." },
      { jp: "結果は察するにかたくない。", vi: "Không khó để đoán kết quả." },
    ],
    category: "Dễ dàng",
  },
  {
    id: 32, pattern: "～までもない", meaning_vi: "không cần phải ~",
    usage: "Không cần thiết. V辞書形 + までもない.",
    examples: [
      { jp: "言うまでもない。", vi: "Không cần phải nói (đương nhiên)." },
      { jp: "わざわざ行くまでもない。", vi: "Không cần phải cất công đi." },
    ],
    category: "Không cần thiết",
  },
  {
    id: 33, pattern: "～でなくてなんだろう", meaning_vi: "không phải ~ thì là gì",
    usage: "Khẳng định mạnh mẽ. N + でなくてなんだろう.",
    examples: [
      { jp: "これが愛でなくてなんだろう。", vi: "Đây không phải tình yêu thì là gì?" },
      { jp: "これが奇跡でなくてなんだろう。", vi: "Đây không phải kỳ tích thì là gì?" },
    ],
    category: "Khẳng định",
  },
  {
    id: 34, pattern: "～にとどまらず", meaning_vi: "không chỉ dừng lại ở ~",
    usage: "Phạm vi vượt ra ngoài. N/V辞書形 + にとどまらず.",
    examples: [
      { jp: "問題は日本にとどまらず、世界に広がっている。", vi: "Vấn đề không chỉ dừng ở Nhật mà lan ra thế giới." },
      { jp: "影響は経済にとどまらない。", vi: "Ảnh hưởng không chỉ dừng ở kinh tế." },
    ],
    category: "Mở rộng phạm vi",
  },
  {
    id: 35, pattern: "～ようでは", meaning_vi: "nếu mà ~ thì",
    usage: "Điều kiện tiêu cực. V/Aている + ようでは.",
    examples: [
      { jp: "こんなことで諦めているようでは成功しない。", vi: "Nếu cứ chuyện thế này mà bỏ thì sẽ không thành công." },
      { jp: "そんな態度ではダメだ。", vi: "Thái độ thế này thì không được." },
    ],
    category: "Điều kiện",
  },
  {
    id: 36, pattern: "～うちに", meaning_vi: "trong khi ~, trong lúc ~",
    usage: "Trong khoảng thời gian một sự việc đang diễn ra. V辞書形/Aい/Nの + うちに.",
    examples: [
      { jp: "若いうちに勉強しなさい。", vi: "Hãy học khi còn trẻ." },
      { jp: "暖かいうちに食べてください。", vi: "Hãy ăn khi còn nóng." },
    ],
    category: "Thời gian",
  },
  {
    id: 37, pattern: "～がゆえに", meaning_vi: "vì ~, do ~",
    usage: "Văn viết trang trọng. V/A普通形/Nである + がゆえに.",
    examples: [
      { jp: "若さがゆえに失敗した。", vi: "Vì còn trẻ nên đã thất bại." },
      { jp: "真実なるがゆえに残酷だ。", vi: "Vì là sự thật nên mới tàn nhẫn." },
    ],
    category: "Lý do",
  },
  {
    id: 38, pattern: "～ところを", meaning_vi: "lúc đang ~ thì",
    usage: "Khi đang trong một hoàn cảnh. V辞書形/Vている/Nの + ところを.",
    examples: [
      { jp: "お忙しいところをすみません。", vi: "Xin lỗi vì làm phiền lúc bạn đang bận." },
      { jp: "寝ているところを起こされた。", vi: "Đang ngủ thì bị đánh thức." },
    ],
    category: "Tình huống",
  },
  {
    id: 39, pattern: "～ものと思われる", meaning_vi: "được cho là, được nghĩ là",
    usage: "Phán đoán khách quan, văn viết. V普通形 + ものと思われる.",
    examples: [
      { jp: "事故が原因と思われる。", vi: "Được cho là do tai nạn." },
      { jp: "改善するものと思われる。", vi: "Được nghĩ là sẽ cải thiện." },
    ],
    category: "Phán đoán",
  },
  {
    id: 40, pattern: "～ないまでも", meaning_vi: "không đến mức ~ nhưng",
    usage: "Không tới mức cao nhất nhưng tới mức nào đó. Vない + までも.",
    examples: [
      { jp: "毎日とは言わないまでも、週に1度は連絡してほしい。", vi: "Không phải mỗi ngày nhưng mỗi tuần một lần thì hãy liên lạc." },
      { jp: "完璧でないまでも合格レベルだ。", vi: "Tuy không hoàn hảo nhưng đạt mức đậu." },
    ],
    category: "Mức độ",
  },
  {
    id: 41, pattern: "～までだ／までのことだ", meaning_vi: "chỉ là ~ thôi, đơn giản là ~",
    usage: "Diễn tả quyết định/lý do đơn giản. V辞書形/Vた + までだ.",
    examples: [
      { jp: "ダメなら諦めるまでだ。", vi: "Nếu không được thì đơn giản là bỏ thôi." },
      { jp: "本当のことを言ったまでだ。", vi: "Chỉ là nói thật thôi." },
    ],
    category: "Quyết định",
  },
  {
    id: 42, pattern: "～しまつだ", meaning_vi: "kết quả lại ~ (xấu)",
    usage: "Cùng nghĩa với 始末だ. V辞書形 + 始末だ.",
    examples: [
      { jp: "最後には泣き出す始末だ。", vi: "Cuối cùng lại còn khóc nữa chứ." },
      { jp: "うそをつく始末だ。", vi: "Đến mức phải nói dối." },
    ],
    category: "Kết cục xấu",
  },
  {
    id: 43, pattern: "～ことだし", meaning_vi: "vì ~ nên",
    usage: "Lý do nhẹ nhàng cho quyết định. V普通形 + ことだし.",
    examples: [
      { jp: "雨も降っていることだし、家にいよう。", vi: "Vì đang mưa nên hãy ở nhà." },
      { jp: "時間もあることだし、ゆっくりしよう。", vi: "Còn thời gian nên hãy thong thả." },
    ],
    category: "Lý do",
  },
  {
    id: 44, pattern: "～ことなしに", meaning_vi: "không ~ thì không thể",
    usage: "Điều kiện cần. V辞書形 + ことなしに.",
    examples: [
      { jp: "努力することなしに成功はない。", vi: "Không nỗ lực thì không có thành công." },
      { jp: "経験することなしに語れない。", vi: "Không trải qua thì không thể nói được." },
    ],
    category: "Điều kiện cần",
  },
  {
    id: 45, pattern: "～が早いか", meaning_vi: "vừa ~ là",
    usage: "Đồng nghĩa với や否や. V辞書形 + が早いか.",
    examples: [
      { jp: "授業終わるが早いか、教室を飛び出した。", vi: "Lớp vừa kết thúc đã lao ra khỏi phòng." },
      { jp: "声をかけるが早いか走り出した。", vi: "Vừa gọi đã chạy đi." },
    ],
    category: "Thời gian",
  },
  {
    id: 46, pattern: "～とあって", meaning_vi: "do ~ nên (lý do đặc biệt)",
    usage: "Lý do đặc biệt khiến điều gì đó xảy ra. N/V普通形 + とあって.",
    examples: [
      { jp: "連休とあって観光客が多い。", vi: "Do là kỳ nghỉ dài nên du khách đông." },
      { jp: "有名な歌手のコンサートとあって満員だ。", vi: "Vì là concert của ca sĩ nổi tiếng nên kín chỗ." },
    ],
    category: "Lý do",
  },
  {
    id: 47, pattern: "～ともすれば／ともすると", meaning_vi: "hơi tý là, có khuynh hướng",
    usage: "Có khuynh hướng dễ ~. ともすれば/ともすると + V.",
    examples: [
      { jp: "ともすれば悲観的になりがちだ。", vi: "Hơi tý là dễ bi quan." },
      { jp: "ともすると怠けてしまう。", vi: "Có khuynh hướng dễ lười." },
    ],
    category: "Khuynh hướng",
  },
  {
    id: 48, pattern: "～にしのびない", meaning_vi: "không nỡ ~",
    usage: "Không nỡ làm gì đó. V辞書形/N + にしのびない.",
    examples: [
      { jp: "捨てるにしのびない。", vi: "Không nỡ vứt đi." },
      { jp: "別れるにしのびない。", vi: "Không nỡ chia tay." },
    ],
    category: "Cảm xúc",
  },
  {
    id: 49, pattern: "～ともあろう", meaning_vi: "đường đường là ~ thế mà",
    usage: "Thất vọng về người/tổ chức có vị thế. N + ともあろうもの/人.",
    examples: [
      { jp: "教育者ともあろう人がそんなことを言うとは。", vi: "Đường đường là nhà giáo mà lại nói thế." },
      { jp: "大企業ともあろうものが情報漏洩を起こした。", vi: "Đường đường là doanh nghiệp lớn mà lại để rò rỉ thông tin." },
    ],
    category: "Thất vọng",
  },
  {
    id: 50, pattern: "～ならでは", meaning_vi: "chỉ có ở ~ mới có",
    usage: "Đặc trưng riêng của ai/cái gì. N + ならでは(の).",
    examples: [
      { jp: "京都ならではの風情。", vi: "Phong vị chỉ có ở Kyoto." },
      { jp: "彼ならではのアイデアだ。", vi: "Ý tưởng chỉ anh ấy mới nghĩ ra." },
    ],
    category: "Đặc trưng",
  },
  {
    id: 51, pattern: "～ようと～まいと", meaning_vi: "dù ~ hay không ~",
    usage: "Không phụ thuộc vào hành động. V意向形 + と + Vない/まい + と.",
    examples: [
      { jp: "雨が降ろうと降るまいと出かける。", vi: "Dù trời mưa hay không cũng đi." },
      { jp: "賛成しようとしまいと、結論は同じだ。", vi: "Dù tán thành hay không, kết luận cũng vậy." },
    ],
    category: "Bất kể",
  },
  {
    id: 52, pattern: "～かれ～かれ", meaning_vi: "dù ~ hay ~",
    usage: "Trạng thái nào cũng được. Aい(語幹) + かれ + Aい(語幹) + かれ.",
    examples: [
      { jp: "遅かれ早かれ、知られるだろう。", vi: "Sớm hay muộn cũng sẽ bị biết." },
      { jp: "多かれ少なかれ問題はある。", vi: "Nhiều hay ít cũng đều có vấn đề." },
    ],
    category: "Bất kể",
  },
  {
    id: 53, pattern: "～ばそれまでだ", meaning_vi: "nếu ~ thì là hết",
    usage: "Một khi ~ xảy ra thì xong. V仮定形 + それまでだ.",
    examples: [
      { jp: "電池が切れればそれまでだ。", vi: "Pin hết là xong." },
      { jp: "嘘がばれればそれまでだ。", vi: "Nói dối mà lộ ra là kết thúc." },
    ],
    category: "Kết thúc",
  },
  {
    id: 54, pattern: "～たら最後", meaning_vi: "một khi đã ~ thì",
    usage: "Một khi làm gì là dứt khoát. Vたら + 最後.",
    examples: [
      { jp: "彼は怒ったら最後、手がつけられない。", vi: "Anh ấy mà nổi nóng thì không ai cản nổi." },
      { jp: "やると決めたら最後、最後までやる。", vi: "Đã quyết làm là làm đến cùng." },
    ],
    category: "Quyết định",
  },
  {
    id: 55, pattern: "～にあたって", meaning_vi: "khi ~, nhân dịp ~",
    usage: "Trong dịp/thời điểm đặc biệt. V辞書形/N + にあたって.",
    examples: [
      { jp: "卒業にあたって挨拶を述べる。", vi: "Nhân dịp tốt nghiệp xin gửi lời chào." },
      { jp: "新年を迎えるにあたって。", vi: "Nhân dịp năm mới." },
    ],
    category: "Thời điểm",
  },
  {
    id: 56, pattern: "～にいたって", meaning_vi: "đến mức ~ thì",
    usage: "Đến tình trạng/mức độ nào đó. N/V辞書形 + に至って.",
    examples: [
      { jp: "事故に至って初めて気づいた。", vi: "Đến lúc tai nạn xảy ra mới nhận ra." },
      { jp: "ここに至っては謝るしかない。", vi: "Đến mức này thì chỉ còn xin lỗi." },
    ],
    category: "Mức độ",
  },
  {
    id: 57, pattern: "～かたがた", meaning_vi: "nhân tiện, kết hợp (kính ngữ)",
    usage: "Trang trọng. N + かたがた.",
    examples: [
      { jp: "ご挨拶かたがたお伺いします。", vi: "Nhân tiện chào hỏi xin được ghé thăm." },
      { jp: "お礼かたがたお邪魔します。", vi: "Nhân tiện cảm ơn xin được ghé." },
    ],
    category: "Đồng thời (trang trọng)",
  },
  {
    id: 58, pattern: "～にして", meaning_vi: "đến tận ~, đến mức ~",
    usage: "Nhấn mạnh thời gian/cấp độ. N + にして.",
    examples: [
      { jp: "70歳にして初めて海外へ行く。", vi: "Đến tận 70 tuổi mới đi nước ngoài lần đầu." },
      { jp: "一瞬にして消えた。", vi: "Biến mất trong tích tắc." },
    ],
    category: "Mức độ",
  },
  {
    id: 59, pattern: "～かたわら", meaning_vi: "bên cạnh ~, song song",
    usage: "Hai việc song song. V辞書形/Nの + かたわら.",
    examples: [
      { jp: "彼は会社員のかたわら作家もしている。", vi: "Bên cạnh công việc nhân viên, anh ấy còn là tác giả." },
      { jp: "勉強のかたわらバイトもする。", vi: "Vừa học vừa làm thêm." },
    ],
    category: "Đồng thời",
  },
  {
    id: 60, pattern: "～にひきかえ", meaning_vi: "trái ngược với ~",
    usage: "Đối lập rõ rệt. N + にひきかえ.",
    examples: [
      { jp: "兄の真面目さにひきかえ、弟は怠け者だ。", vi: "Trái với sự nghiêm túc của anh, em trai rất lười." },
      { jp: "去年にひきかえ今年は売上が良い。", vi: "Trái với năm ngoái, năm nay doanh số tốt." },
    ],
    category: "Tương phản",
  },
];
