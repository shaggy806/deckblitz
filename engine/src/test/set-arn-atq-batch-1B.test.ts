/**
 * Arabian Nights + Antiquities, group B (B131): Hasran Ogress, King
 * Suleiman, Ashnod's Transmogrant, Detonate, Circle of Protection:
 * Artifacts, Rakalite.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, counters, hand, lands, life, nextTurn, pickModes, pickPermanents, ref, spawn, table, toHand, toStep, types, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** `source` deals 2 damage to each of its controller's opponents. */
const ping = (game: Game, source: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, who: "each-opponent" }, [], {
    source,
  });

describe("ARN+ATQ group B", () => {
  it("Hasran Ogress deals 3 damage to you unless you pay {2}", () => {
    const { game, a } = table();
    const ogress = spawn(game, "Hasran Ogress");
    attack(game, a, [ogress]);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);

    const second = table();
    const ogress2 = spawn(second.game, "Hasran Ogress");
    lands(second.game, "Swamp", 2);
    pickModes(second.a, 0);
    attack(second.game, second.a, [ogress2]);
    expect(life(second.game, A)).toBe(20);
    expect(second.game.battlefield.filter((id) => second.game.state.objects[id].tapped).length).toBe(3);
  });

  it("King Suleiman targets only a Djinn or an Efreet", () => {
    const { game } = table();
    const king = spawn(game, "King Suleiman");
    const king2 = spawn(game, "King Suleiman");
    const djinn = spawn(game, "Mahamoti Djinn", B);
    const efreet = spawn(game, "Serendib Efreet", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, king, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, king, 0, { targets: [ref(djinn)] });
    activate(game, king2, 0, { targets: [ref(efreet)] });
    expect(zone(game, djinn)).toBe("graveyard");
    expect(zone(game, efreet)).toBe("graveyard");
  });

  it("Ashnod's Transmogrant: a +1/+1 counter, and the creature stays an artifact without it", () => {
    const { game } = table();
    const transmogrant = spawn(game, "Ashnod's Transmogrant");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, transmogrant, 0, { targets: [ref(bears)] });
    expect(zone(game, transmogrant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(types(game, bears)).toContain("artifact");
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    nextTurn(game);
    expect(counters(game, bears)).toBe(0);
    expect(types(game, bears)).toContain("artifact");
  });

  it("Detonate destroys an artifact of mana value X and deals X to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const stone = spawn(game, "Mind Stone", B);
    const ring = spawn(game, "Sol Ring", B);
    expect(() => cast(game, toHand(game, "Detonate"), { x: 2, targets: [ref(ring)] })).toThrow();
    cast(game, toHand(game, "Detonate"), { x: 2, targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("Circle of Protection: Artifacts offers only artifact sources and stops the chosen one's next damage", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Protection: Artifacts");
    lands(game, "Plains", 2);
    const thopter = spawn(game, "Ornithopter", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const seen = pickPermanents(a, thopter);
    activate(game, circle, 0);
    expect(seen.offered).toContain(thopter);
    expect(seen.offered).not.toContain(goblin);
    ping(game, thopter);
    expect(life(game, A)).toBe(20);
    ping(game, thopter);
    expect(life(game, A)).toBe(18);
  });

  it("Rakalite prevents 1 and returns to hand at the end step — only if it's still there", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const rakalite = spawn(game, "Rakalite");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, rakalite, 0, { targets: [ref(A)] });
    ping(game, goblin);
    expect(life(game, A)).toBe(19);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.turn.step === "end" && s.priority.holder === A);
    expect(hand(game)).toContain(rakalite);

    const second = table();
    lands(second.game, "Wastes", 2);
    const rakalite2 = spawn(second.game, "Rakalite");
    activate(second.game, rakalite2, 0, { targets: [ref(A)] });
    second.game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(rakalite2)]);
    nextTurn(second.game);
    expect(zone(second.game, rakalite2)).toBe("graveyard");
  });
});
