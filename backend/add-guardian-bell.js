/**
 * Adds "Guardian Bell" product to the correct MongoDB database.
 * Auto-discovers the right database in the cluster.
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

// ── Load .env manually ─────────────────────────────────────────────────────────
function loadEnv(envPath) {
    if (!fs.existsSync(envPath)) return {};
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    const env = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '');
        env[key] = val;
    }
    return env;
}

const env = loadEnv(__dirname + '\\.env');
const rawUri = env.MONGO_URI || env.MONGODB_URI;

if (!rawUri) {
    console.error('❌ No MongoDB URI in .env');
    process.exit(1);
}

async function main() {
    console.log('🔌 Connecting to MongoDB Atlas...');
    const client = new MongoClient(rawUri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    console.log('✅ Connected!');

    // ── List ALL databases in the cluster ────────────────────────────────────────
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    console.log('\n📋 All databases in cluster:');
    databases.forEach(d => console.log(`   • ${d.name} (${(d.sizeOnDisk / 1024).toFixed(1)} KB)`));

    // ── Find the right database (has both users + products collections) ──────────
    let targetDb = null;
    let targetDbName = '';

    for (const dbInfo of databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = client.db(dbInfo.name);
        const cols = await db.listCollections().toArray();
        const names = cols.map(c => c.name);
        console.log(`\n   DB "${dbInfo.name}" collections: ${names.join(', ') || '(empty)'}`);

        if (names.includes('products') && names.includes('users')) {
            targetDb = db;
            targetDbName = dbInfo.name;
            console.log(`\n✅ Targeting database: "${targetDbName}"`);
            break;
        }
    }

    if (!targetDb) {
        // Fallback: use the first non-system DB
        const dbs = databases.filter(d => !['admin', 'local', 'config'].includes(d.name));
        if (dbs.length > 0) {
            targetDbName = dbs[0].name;
            targetDb = client.db(targetDbName);
            console.log(`⚠️  No DB with both products+users found. Using first DB: "${targetDbName}"`);
        } else {
            console.error('❌ No suitable database found.');
            await client.close();
            process.exit(1);
        }
    }

    // ── Find a seller or admin user ──────────────────────────────────────────────
    const usersCol = targetDb.collection('users');
    let seller = await usersCol.findOne({ role: 'seller' });
    if (!seller) seller = await usersCol.findOne({ role: 'admin' });
    if (!seller) {
        const allUsers = await usersCol.find({}).limit(3).toArray();
        console.log('Users found:', allUsers.map(u => ({ name: u.name, role: u.role })));
        console.error('❌ No seller/admin user found!');
        await client.close();
        process.exit(1);
    }
    console.log(`\n👤 Using: ${seller.name} (${seller.email}) — role: ${seller.role}`);

    // ── Check/create slug ────────────────────────────────────────────────────────
    const productsCol = targetDb.collection('products');
    const baseSlug = 'guardian-bell';
    const existingProduct = await productsCol.findOne({ slug: baseSlug });
    const slug = existingProduct ? `${baseSlug}-${Date.now()}` : baseSlug;

    if (existingProduct) {
        console.log(`ℹ️  Slug "${baseSlug}" already exists — using "${slug}"`);
    }

    // ── Product document ──────────────────────────────────────────────────────────
    const now = new Date();
    const productDoc = {
        name: 'Guardian Bell',
        slug,
        description: 'Guardian bell Keychain for bikes',
        price: 1,
        stock: 48,
        images: ['https://m.media-amazon.com/images/I/71gKOYq1OLL._SL1500_.jpg'],
        seller: seller._id,
        attributes: {},
        ratings: { average: 0, count: 0 },
        isActive: true,
        createdAt: now,
        updatedAt: now,
        __v: 0,
    };

    const result = await productsCol.insertOne(productDoc);

    console.log('\n🎉 PRODUCT ADDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Database    : ${targetDbName}`);
    console.log(`  Product ID  : ${result.insertedId}`);
    console.log(`  Name        : Guardian Bell`);
    console.log(`  Description : Guardian bell Keychain for bikes`);
    console.log(`  Price       : ₹1`);
    console.log(`  Stock       : 48`);
    console.log(`  Image       : ${productDoc.images[0]}`);
    console.log(`  Seller      : ${seller.name}`);
    console.log(`  Active      : true`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await client.close();
    console.log('\n✅ Done! Refresh your app to see the product.');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
