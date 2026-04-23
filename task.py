def editDistance(A, B):
    n = len(A)
    m = len(B)
    table = [[0] * (m + 1) for i in range(n + 1)]

    for i in range(n + 1):
        table[i][0] = i
    for j in range(m + 1):
        table[0][j] = j
    
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            insertion = table[i][j - 1] + 1
            deletion =table[i - 1][j] + 1
            matching = table[i - 1][j - 1]
            mismatch = table[i - 1][j - 1] + 1
            if A[i - 1] == B[j - 1]:
                table[i][j] = min(insertion,deletion,matching)
            else:
                table[i][j] = min(insertion,deletion,mismatch)
    
    return table[n][m]


print(editDistance('abacab', 'bacacaba'))
