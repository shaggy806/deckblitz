/**
 * The `become-copy` effect: an existing permanent — or every one a filter
 * matches — becomes a copy of an object (rules 707.2, 707.4, 613.2 — layer
 * 1), until end of turn, until the next end step, until its controller's next
 * turn, or for good, with copy exceptions ("except it has this ability").
 * It stays the same permanent: its counters, status and the non-copy
 * effects on it stay, and nothing enters or leaves.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf, printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  keywords,
  lands,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
} from "./harness.js";

const copyOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("become-copy — until end of turn", () => {
  it("keeps its own counters, tapped state and other effects, and is itself again after cleanup", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mirror = spawn(game, "Mirage Mirror", A, { tapped: true });
    game.state.objects[mirror].counters["+1/+1"] = 1;
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 2;
    activate(game, mirror, 0, { targets: [ref(giant)] });
    expect(copyOf(game, mirror)).toBe("Hill Giant");
    // Hill Giant's 3/3, plus its own counter — not the Giant's two.
    expect(pt(game, mirror)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[mirror].tapped).toBe(true);
    // A copy has the copied permanent's abilities, not its own: no {2} ability.
    expect(() => activate(game, mirror, 0, { targets: [ref(giant)] })).toThrow();
    nextTurn(game);
    expect(copyOf(game, mirror)).toBe("Mirage Mirror");
    expect(types(game, mirror)).toEqual(["artifact"]);
    expect(counters(game, mirror)).toBe(1);
  });

  it("copies what the target is copying, with that copy's exceptions (rule 707.9b)", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const mirror = spawn(game, "Mirage Mirror");
    const loki = spawn(game, "Loki, Lord of Misrule");
    const bears = spawn(game, "Grizzly Bears");
    // Loki becomes a nonlegendary Grizzly Bears until end of turn…
    lands(game, "Island", 1);
    activate(game, loki, 0, { targets: [ref(bears)] });
    expect(copyOf(game, loki)).toBe("Grizzly Bears");
    // …and the Mirror copying Loki is a Grizzly Bears — "isn't legendary"
    // and all — though not until end of turn because Loki's is.
    activate(game, mirror, 0, { targets: [ref(loki)] });
    expect(copyOf(game, mirror)).toBe("Grizzly Bears");
    expect(supertypes(game, mirror)).toEqual([]);
  });

  it("several in one turn: the last to resolve wins, and all end together", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const mirror = spawn(game, "Mirage Mirror");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, mirror, 0, { targets: [ref(giant)], settle: false });
    activate(game, mirror, 0, { targets: [ref(bears)] });
    // The second activation (on top) resolved first; the Giant's last.
    expect(copyOf(game, mirror)).toBe("Hill Giant");
    nextTurn(game);
    expect(copyOf(game, mirror)).toBe("Mirage Mirror");
  });
});

describe("become-copy — durations layered (rule 613.7a)", () => {
  it("a temporary copy over a lasting one ends back at the lasting one", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const stage = spawn(game, "Thespian's Stage");
    const forest = spawn(game, "Forest", B);
    activate(game, stage, 1, { targets: [ref(forest)] });
    expect(copyOf(game, stage)).toBe("Forest");
    game.debugApplyEffect(A, { kind: "become-copy", target: 0, of: 1, until: "end-of-turn" }, [
      ref(stage),
      ref(spawn(game, "Island", B)),
    ]);
    expect(copyOf(game, stage)).toBe("Island");
    nextTurn(game);
    expect(copyOf(game, stage)).toBe("Forest");
  });

  it("a lasting copy made while a temporary one applies outlasts it", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const mirror = spawn(game, "Mirage Mirror");
    const stage = spawn(game, "Thespian's Stage", B);
    const forest = spawn(game, "Forest", B);
    // The Mirror becomes a Thespian's Stage until end of turn, and as one
    // becomes a Forest for good (with the Stage's ability).
    activate(game, mirror, 0, { targets: [ref(stage)] });
    activate(game, mirror, 1, { targets: [ref(forest)] });
    expect(copyOf(game, mirror)).toBe("Forest");
    nextTurn(game);
    expect(copyOf(game, mirror)).toBe("Forest");
    expect(game.state.objects[mirror].temporaryCopies).toBeUndefined();
  });

  it("until your next turn ends as its controller's next turn begins, not before", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const effect: EffectSpec = { kind: "become-copy", target: 0, of: 1, until: "your-next-turn" };
    game.debugApplyEffect(A, effect, [ref(bears), ref(giant)]);
    nextTurn(game); // Bob's turn
    expect(copyOf(game, bears)).toBe("Hill Giant");
    nextTurn(game); // Alice's
    expect(copyOf(game, bears)).toBe("Grizzly Bears");
  });

  it("until the next end step ends as the end step begins", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "become-copy", target: 0, of: 1, until: "next-end-step" }, [ref(bears), ref(giant)]);
    toStep(game, "postcombat-main");
    expect(copyOf(game, bears)).toBe("Hill Giant");
    toStep(game, "end");
    expect(copyOf(game, bears)).toBe("Grizzly Bears");
  });

  it("ends when the permanent leaves: it comes back as itself (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const stage = spawn(game, "Thespian's Stage");
    activate(game, stage, 1, { targets: [ref(spawn(game, "Forest", B))] });
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(stage)]);
    settle(game);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Thespian's Stage")!;
    expect(copyOf(game, back)).toBe("Thespian's Stage");
  });
});

describe("become-copy — a card, not a permanent", () => {
  it("copies a card's printed values, front face up (rule 712.8a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const card = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "become-copy", target: 0, of: 1 }, [ref(bears), ref(card)]);
    expect(copyOf(game, bears)).toBe("Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("become-copy — every permanent a filter matches", () => {
  it("each other one copies the object as it was before any changed; the object itself doesn't", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const legend = spawn(game, "Loki, Lord of Misrule");
    cast(game, toHand(game, "Nanogene Conversion"), { targets: [ref(legend)] });
    expect(copyOf(game, bears)).toBe("Loki, Lord of Misrule");
    expect(copyOf(game, giant)).toBe("Loki, Lord of Misrule");
    expect(supertypes(game, bears)).toEqual([]);
    // The target stays itself, and legendary.
    expect(supertypes(game, legend)).toEqual(["legendary"]);
    expect(nameOf(game.state.objects[giant])).toBe("Loki, Lord of Misrule");
    nextTurn(game);
    expect(copyOf(game, bears)).toBe("Grizzly Bears");
    expect(copyOf(game, giant)).toBe("Hill Giant");
  });

  it("keeps each one's counters and keywords granted to it", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Nanogene Conversion"), { targets: [ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).size).toBe(0);
  });
});
