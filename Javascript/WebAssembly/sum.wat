(module
  (func $sum_upto (param $n i64) (result i64)
    (local $i i64)
    (local $sum i64)

    ;; Initialize i = 1, sum = 0
    (local.set $i (i64.const 1))
    (local.set $sum (i64.const 0))

    ;; Loop while i <= n
    (block $break
      (loop $continue
        ;; Check if i > n
        (br_if $break (i64.gt_s (local.get $i) (local.get $n)))

        ;; sum = sum + i
        (local.set $sum (i64.add (local.get $sum) (local.get $i)))

        ;; i = i + 1
        (local.set $i (i64.add (local.get $i) (i64.const 1)))

        ;; Continue loop
        (br $continue)
      )
    )

    ;; Return sum
    (local.get $sum)
  )

  (export "sum_upto" (func $sum_upto))
)