/**
 * Opus (Secrets of Strixhaven — an ability word): "Whenever you cast an instant
 * or sorcery spell, … If five or more mana was spent to cast that spell, …".
 * The trigger resolves before that spell, and still reads what was spent on
 * it if the spell has since been countered (the ruling): the
 * `trigger-object` condition's `manaSpent` falls back to
 * `GameObject.lastStackManaSpent`.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, hand, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";

describe("opus", () => {
  it("under five mana, the small effect", () => {
    const { game } = table();
    spawn(game, "Thunderdrum Soloist");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    // Shock's 2 and the Soloist's 1.
    expect(life(game, B)).toBe(17);
  });

  it("five or more spent, the big one", () => {
    const { game } = table();
    spawn(game, "Thunderdrum Soloist");
    // A five-mana spell: Stroke of Genius ({X}{2}{U}) for X = 2.
    lands(game, "Island", 5);
    cast(game, toHand(game, "Stroke of Genius"), { targets: [{ kind: "player", player: A }], x: 2 });
    expect(life(game, B)).toBe(17);
  });

  it("countered before the trigger resolves, it still counts what was spent (the ruling)", () => {
    const { game } = table();
    const maestro = spawn(game, "Molten-Core Maestro");
    lands(game, "Island", 5);
    const stroke = toHand(game, "Stroke of Genius");
    cast(game, stroke, { targets: [{ kind: "player", player: A }], x: 2, settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(stroke)]);
    settle(game);
    expect(game.state.objects[stroke].zone).toBe("graveyard");
    // +1/+1 counter on a 2/2: power 3, so {R}{R}{R}.
    expect(counters(game, maestro)).toBe(1);
    expect(game.state.players[A].manaPool.filter((m) => m.type === "R").length).toBe(3);
  });

  it("Muse Seeker discards only under five", () => {
    const { game, a } = table();
    spawn(game, "Muse Seeker");
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    const shock = toHand(game, "Shock");
    a.chooseDiscardsFn = (h) => [h[0].id];
    cast(game, shock, { targets: [{ kind: "player", player: B }] });
    // +1 Shock in hand, -1 cast, +1 drawn, -1 discarded.
    expect(hand(game).length).toBe(before);
  });
});
