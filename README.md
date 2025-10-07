# 🌶️ Trinity Chili Cook-off

A Next.js application for managing chili cook-off competitions with Firebase backend.

## 🚀 Features

- ✅ **Chili Registration System** - Participants can register their chili entries
- ✅ **Judge Login & Grading** - Secure judge authentication and grading interface
- ✅ **Admin Dashboard** - Administrative controls and oversight
- ✅ **Real-time Results** - Live updates and winner announcements
- ✅ **Firebase Integration** - Firestore database and authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: GitHub Pages with GitHub Actions

## 📱 Live Demo

Visit the live application: [Trinity Chili Cook-off](https://jeffw412.github.io/Trinity-Chili/)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Firebase project set up

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jeffw412/Trinity-Chili.git
cd Trinity-Chili/trinity-chili-cookoff
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase configuration in your project

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Firebase Setup

Follow the instructions in `QUICK_SETUP.md` for complete Firebase configuration:

1. Create Firestore database
2. Enable Authentication
3. Create user accounts
4. Set up security rules

## 📦 Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

```bash
npm run build
```

## 🏗️ Project Structure

```
trinity-chili-cookoff/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── firebase.json     # Firebase configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For setup help, refer to the `QUICK_SETUP.md` file or create an issue in the repository.
