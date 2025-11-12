        
        // ============================================
        // SUPABASE CONFIGURATION
        // ============================================
        const SUPABASE_URL = 'https://tidabdmycakgodqggaco.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZGFiZG15Y2FrZ29kcWdnYWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTQ1ODksImV4cCI6MjA3ODUzMDU4OX0.BWzUOhjZoYh86rcm_toFsqvCLIlhNkZQaV3krjgAKBE';
        
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // ============================================
        // HELPER FUNCTIONS
        // ============================================
        function showMessage(message, isError = false) {
            const statusDiv = document.getElementById('statusMessage');
            statusDiv.textContent = message;
            statusDiv.className = `mb-4 p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
            statusDiv.classList.remove('hidden');
            
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 3000);
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(amount);
        }

        // ============================================
        // LOAD BILLS FROM SUPABASE
        // ============================================
        async function loadBills() {
            try {
                const { data, error } = await supabase
                    .from('bills')
                    .select('*')
                    .order('due_date', { ascending: true });

                if (error) throw error;

                // Separate paid and unpaid bills
                const unpaidBills = data.filter(bill => bill.status === 'unpaid');
                const paidBills = data.filter(bill => bill.status === 'paid');

                displayBills(unpaidBills, 'unpaidBillsList', 'unpaid');
                displayBills(paidBills, 'paidBillsList', 'paid');
            } catch (error) {
                console.error('Error loading bills:', error);
                showMessage('Error loading bills: ' + error.message, true);
            }
        }

        // ============================================
        // DISPLAY BILLS
        // ============================================
        function displayBills(bills, containerId, type) {
            const billsList = document.getElementById(containerId);
            
            if (!bills || bills.length === 0) {
                const emptyMessage = type === 'unpaid' 
                    ? 'No unpaid bills' 
                    : 'No paid bills yet';
                const emptySubtext = type === 'unpaid'
                    ? 'All caught up! 🎉'
                    : 'Paid bills will appear here';
                    
                billsList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-64">
                        <svg class="w-16 h-16 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${type === 'paid' 
                                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>'
                            }
                        </svg>
                        <p class="text-stone-500 text-center">${emptyMessage}</p>
                        <p class="text-stone-400 text-sm text-center mt-2">${emptySubtext}</p>
                    </div>
                `;
                return;
            }

            billsList.innerHTML = bills.map(bill => `
                <div class="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow ${type === 'paid' ? 'bg-green-50' : ''}">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-semibold text-stone-800">${bill.bill_name}</h3>
                            <p class="text-xs text-stone-500">Invoice: #${bill.invoice_number}</p>
                        </div>
                        <span class="text-green-900 font-bold">${formatCurrency(bill.amount)}</span>
                    </div>
                    <div class="text-sm text-stone-600 mb-2 space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Bill: ${formatDate(bill.bill_date)}</span>
                            <span class="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Due: ${formatDate(bill.due_date)}</span>
                        </div>
                    </div>
                    ${bill.notes ? `<p class="text-sm text-stone-500 mb-2">${bill.notes}</p>` : ''}
                    <div class="flex gap-2 mt-3">
                        ${type === 'unpaid' 
                            ? `<button onclick="markAsPaid('${bill.id}')" class="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Mark as Paid</button>`
                            : `<span class="text-xs bg-green-600 text-white px-3 py-1 rounded">✓ Paid</span>`
                        }
                        <button onclick="deleteBill('${bill.id}')" class="text-xs text-red-600 hover:text-red-800 px-3 py-1">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        // ============================================
        // ADD BILL TO SUPABASE
        // ============================================
        async function addBill(billData) {
            try {
                console.log('Sending bill data:', billData);
                
                const { data, error } = await supabase
                    .from('bills')
                    .insert([billData])
                    .select();

                if (error) {
                    console.error('Supabase error details:', error);
                    throw error;
                }

                showMessage('Bill added successfully!');
                loadBills();
                return data;
            } catch (error) {
                console.error('Error adding bill:', error);
                showMessage('Error adding bill: ' + error.message, true);
                throw error;
            }
        }

        // ============================================
        // MARK BILL AS PAID
        // ============================================
        async function markAsPaid(billId) {
            try {
                const { error } = await supabase
                    .from('bills')
                    .update({ status: 'paid' })
                    .eq('id', billId);

                if (error) throw error;

                showMessage('Bill marked as paid!');
                loadBills();
            } catch (error) {
                console.error('Error updating bill:', error);
                showMessage('Error updating bill: ' + error.message, true);
            }
        }

        // ============================================
        // DELETE BILL
        // ============================================
        async function deleteBill(billId) {
            if (!confirm('Are you sure you want to delete this bill?')) return;
            
            try {
                const { error } = await supabase
                    .from('bills')
                    .delete()
                    .eq('id', billId);

                if (error) throw error;

                showMessage('Bill deleted successfully!');
                loadBills();
            } catch (error) {
                console.error('Error deleting bill:', error);
                showMessage('Error deleting bill: ' + error.message, true);
            }
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        document.getElementById('fill-bill-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const billData = {
                bill_name: document.getElementById('bill-name').value,
                invoice_number: document.getElementById('invoice-number').value,
                amount: parseFloat(document.getElementById('amount').value),
                bill_date: document.getElementById('bill-date').value,
                due_date: document.getElementById('due-date').value,
                status: document.getElementById('status').value,
                notes: document.getElementById('notes').value || null
            };

            await addBill(billData);
            this.reset();
        });

        document.getElementById('signOut').addEventListener('click', async function() {
            if (confirm('Are you sure you want to sign out?')) {
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    window.location.href = 'index.html';
                }
            }
        });

        // ============================================
        // INITIALIZE
        // ============================================
        loadBills();    