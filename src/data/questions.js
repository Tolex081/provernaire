// src/data/questions.js
export const questions = [
  {
    id: 1,
    question: "What is the core purpose of Stage 2.5 in Succinct's roadmap?",
    options: ["To launch the mainnet", "To test and operationalize the decentralized proving marketplace", "To distribute tokens", "To develop a new zkVM verifier"],
    correctAnswer: 1,
    category: "Succinct Roadmap"
  },
  {
    id: 2,
    question: "What happens in the decentralized proving marketplace during Stage 2.5?",
    options: ["Provers generate validity proofs for user-submitted jobs", "Validators produce blocks", "Developers build new dApps", "Users stake tokens"],
    correctAnswer: 0,
    category: "Decentralized Proving"
  },
  {
    id: 3,
    question: "How are jobs auctioned in Stage 2.5?",
    options: ["Via an on-chain auctioneer", "Via an off-chain auctioneer", "Via a centralized server", "Via a decentralized exchange"],
    correctAnswer: 1,
    category: "Auction Mechanism"
  },
  {
    id: 4,
    question: "What is the role of the off-chain auctioneer?",
    options: ["To verify proof submissions", "To collect proof requests and let provers bid", "To distribute rewards", "To develop new zkVM verifiers"],
    correctAnswer: 1,
    category: "Auction Mechanism"
  },
  {
    id: 5,
    question: "How are proof submissions verified and settled?",
    options: ["Off-chain", "On-chain", "Via a centralized server", "Via a decentralized exchange"],
    correctAnswer: 1,
    category: "Proof Verification"
  },
  {
    id: 6,
    question: "What is the purpose of the test $PROVE token?",
    options: ["To reward provers", "To test the incentive layer", "To develop new dApps", "To launch the mainnet"],
    correctAnswer: 1,
    category: "Tokenomics"
  },
  {
    id: 7,
    question: "What dynamics will be tested with the test $PROVE token?",
    options: ["Staking dynamics and slashing for bad proofs", "Reward distribution and governance", "All of the above", "None of the above"],
    correctAnswer: 2,
    category: "Tokenomics"
  },
  {
    id: 8,
    question: "Why must provers stake test $PROVE to bid?",
    options: ["To prevent spam", "To encourage good behavior", "To test the economic layer", "All of the above"],
    correctAnswer: 3,
    category: "Staking Mechanism"
  },
  {
    id: 9,
    question: "What will developers be able to do during Stage 2.5?",
    options: ["Submit jobs and watch decentralized provers generate results", "Develop new dApps", "Launch the mainnet", "Distribute tokens"],
    correctAnswer: 0,
    category: "Developer Experience"
  },
  {
    id: 10,
    question: "What benefit does Succinct's proof API provide?",
    options: ["Integration with Succinct's proof APIs", "Simulation of real proving workloads", "Building with confidence toward mainnet", "All of the above"],
    correctAnswer: 3,
    category: "API Benefits"
  },
  {
    id: 11,
    question: "What is the expected outcome of Stage 2.5?",
    options: ["Launch of the mainnet", "Distribution of tokens", "Testing and operationalization of the decentralized proving marketplace", "Development of new zkVM verifiers"],
    correctAnswer: 2,
    category: "Succinct Roadmap"
  },
  {
    id: 12,
    question: "What is the role of provers in Stage 2.5?",
    options: ["To generate validity proofs for user-submitted jobs", "To validate blocks", "To develop new dApps", "To distribute rewards"],
    correctAnswer: 0,
    category: "Prover Role"
  },
  {
    id: 13,
    question: "How will Succinct's decentralized proving marketplace impact the ZK space?",
    options: ["It will provide infrastructure for other infra too", "It will launch the mainnet", "It will distribute tokens", "It will develop new zkVM verifiers"],
    correctAnswer: 0,
    category: "ZK Infrastructure"
  },
  {
    id: 14,
    question: "What is the significance of Stage 2.5 for Succinct?",
    options: ["It will test the technical performance of the network", "It will test the economic layer of the network", "It will provide a testbed for developers", "All of the above"],
    correctAnswer: 3,
    category: "Network Testing"
  },
  {
    id: 15,
    question: "What will be observed during Stage 2.5?",
    options: ["Provers competing to generate validity proofs", "Jobs being auctioned via an off-chain auctioneer", "Proof submissions being verified and settled on-chain", "All of the above"],
    correctAnswer: 3,
    category: "Network Observation"
  },
  {
    id: 16,
    question: "What is the purpose of the slashing mechanism?",
    options: ["To discourage bad behavior", "To encourage good behavior", "To distribute rewards", "To launch the mainnet"],
    correctAnswer: 0,
    category: "Security Mechanism"
  },
  {
    id: 17,
    question: "How will the incentive layer be tested?",
    options: ["Through staking dynamics and slashing for bad proofs", "Through reward distribution and governance", "Through simulation of real proving workloads", "All of the above"],
    correctAnswer: 3,
    category: "Incentive Testing"
  },
  {
    id: 18,
    question: "What is the primary function of SP1 in the Succinct Prover Network?",
    options: ["To mathematically re-execute logic in a zero-knowledge virtual machine (zkVM)", "To act as a decentralized exchange for trading $PROVE tokens", "To serve as a layer-1 blockchain for Ethereum scaling", "To manage user balances and proof requests on the Sepolia testnet"],
    correctAnswer: 0,
    category: "SP1 Technology"
  },
  {
    id: 19,
    question: "What distinguishes a ZKP generated by SP1 from a simple 'result slip'?",
    options: ["It is a cryptographic token used for governance", "It requires Ethereum to re-execute the entire logic", "It is a mathematical signature that cannot be forged", "It is a temporary placeholder for proof verification"],
    correctAnswer: 2,
    category: "ZKP Properties"
  },
  {
    id: 20,
    question: "What is the main goal of the Succinct Prover Network in Stage 2.5?",
    options: ["To transition to a layer-1 blockchain for Ethereum", "To distribute $PROVE tokens to all Ethereum users", "To replace Ethereum's consensus mechanism with ZKPs", "To enable provers to compete via a reverse auction on the Sepolia testnet"],
    correctAnswer: 3,
    category: "Network Goals"
  },
  {
    id: 21,
    question: "Why does Ethereum not need to 'run faster'?",
    options: ["Because it relies on a single valid line of proof from SP1", "Because it uses AI to optimize transaction processing", "Because it has sufficient checkout counters for scalability", "Because it offloads all transactions to Solana"],
    correctAnswer: 0,
    category: "Ethereum Scaling"
  },
  {
    id: 22,
    question: "What hardware is recommended for running a prover node in Succinct's Stage 2.5?",
    options: ["Standard consumer CPUs with 16GB RAM", "FPGA-based systems for real-time processing", "High-end GPUs like NVIDIA L4s, L40s, 3090s, or 4090s", "Mobile devices with high-speed internet"],
    correctAnswer: 2,
    category: "Hardware Requirements"
  },
  {
    id: 23,
    question: "What is the purpose of generating an SSH key pair for setting up a prover node in the Succinct Prover Network?",
    options: ["To encrypt testPROVE token transactions on the Sepolia testnet", "To securely access the GPU server remotely", "To authenticate the prover node with the SP1 Hypercube", "To secure the storage of ZKP outputs on the server"],
    correctAnswer: 1,
    category: "Node Setup"
  },
  {
    id: 24,
    question: "How does the Succinct Prover Network ensure fairness in proof request allocation?",
    options: ["By using a first-come, first-served model", "By requiring provers to hold Sepolia ETH", "By centralizing proof allocation to a single authority", "By implementing a reverse auction model"],
    correctAnswer: 3,
    category: "Fairness Mechanism"
  },
  {
    id: 25,
    question: "What role does Ethereum play in the Succinct Prover Network's architecture?",
    options: ["It re-executes all ZKP logic for verification", "It generates the ZKPs using SP1 Hypercube", "It acts as the final checker for proof verification", "It distributes testPROVE tokens to provers"],
    correctAnswer: 2,
    category: "Ethereum Integration"
  },
  {
    id: 26,
    question: "What is a key benefit of offloading logic to SP1 for Ethereum?",
    options: ["It reduces the computational burden on Ethereum nodes", "It eliminates the need for gas fees on Ethereum", "It enables Ethereum to process transactions faster than Solana", "It replaces Ethereum's consensus with a ZKP-based system"],
    correctAnswer: 0,
    category: "Performance Benefits"
  },
  {
    id: 27,
    question: "What is the significance of SP1 Hypercube's proving time for Ethereum blocks?",
    options: ["It reduces proof size to 1 KB for all transactions", "It eliminates the need for on-chain verification", "It proves blocks in under 12 seconds, enabling real-time verification", "It requires a trusted setup for proof generation"],
    correctAnswer: 2,
    category: "Performance Metrics"
  },
  {
    id: 28,
    question: "Why is the reverse auction model used in Stage 2.5 significant?",
    options: ["It ensures provers are paid in Sepolia ETH", "It allocates proof requests to the lowest bidder, optimizing costs", "It requires provers to stake Ethereum mainnet tokens", "It centralizes proof generation for faster processing"],
    correctAnswer: 1,
    category: "Economic Model"
  },
  {
    id: 29,
    question: "What is a key feature of the Succinct Prover Network's design in Stage 2.5?",
    options: ["It operates entirely on Ethereum mainnet", "It requires provers to run on CPU-only hardware", "It uses a verifiable application (vApp) architecture", "It eliminates the need for staking testPROVE tokens"],
    correctAnswer: 2,
    category: "Architecture Design"
  },
  {
    id: 30,
    question: "How does SP1 enhance Ethereum's scalability without hardware upgrades?",
    options: ["By increasing Ethereum's transaction per second (TPS) capacity", "By offloading logic to a zkVM and providing verifiable proofs", "By integrating AI-driven transaction processing", "By replacing Ethereum's virtual machine with SP1"],
    correctAnswer: 1,
    category: "Scalability Solution"
  }
];
export default questions;