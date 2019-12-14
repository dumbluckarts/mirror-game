
var Event = (function () {
    return {
        Generic(options) {
            var text = options.text
            var period = options.period
            var finished = options.finished

            if (!text || !finished) return;
            if (!period) period = 0
            function exec() {
                setTimeout(() => {
                    finished(period)
                }, period)
            }
            return { text, period, exec }
        },
        Message(options) {
            var text = options.text
            var period = options.period
            var call = options.call
            var finished = options.finished

            if (!text || !call || !finished) return;
            if (!period) period = 0

            var chars = text.split('')
            var offset = period
            var result = ""

            function build() {
                for (const char of chars) {
                    setTimeout(() => {
                        result += char
                        call(char, result)
                    }, offset)
                    offset += period
                }
                setTimeout(() => {
                    finished(result, offset)
                }, offset -= period)
            }

            return { text, period, result, build }
        }
    }
})()

var dialogue = (function () {
    var buffer = []

    // data storage object
    var data = {
        string: "",
        DONE: 0
    }

    data.wait = function (p) {
        buffer.push(Event.Generic({
            text: 'wait',
            period: p,
            finished() {
                buffer.shift()
                data.run()
            }
        }))

        return data
    }
    data.sleep = data.wait

    data.append = function (m, p = 0.0) {
        buffer.push(Event.Message({
            text: m,
            period: p,
            call(char) {
                data.string += char
            },
            finished() {
                buffer.shift()
                data.run()
            }
        }))

        return data
    }
    data.text = data.append
    data.scroll = data.append

    data.clear = function (p = 0.0) {
        buffer.push(Event.Generic({
            text: 'clear',
            period: p,
            finished() {
                data.string = ""
                buffer.shift()
                data.run()
            }
        }))

        return data
    }

    data.newline = function () {
        buffer.push(Event.Generic({
            text: '\n',
            period: 0,
            finished() {
                data.string += '\n'
                buffer.shift()
                data.run()
            }
        }))
    }
    data.new = data.newline

    data.run = function () {
        var ele = buffer[0]

        if (buffer.length == 0)
            data.DONE = 1
        if (!ele) return

        // is message event
        if (ele.hasOwnProperty('build'))
            ele.build()
        // generic event
        if (ele.hasOwnProperty('exec'))
            ele.exec()
    }

    data.start = function () {
        data.DONE = 0
        data.run();
    }

    return data
})()