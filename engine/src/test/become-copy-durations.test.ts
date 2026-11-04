/**
 * `become-copy` for a duration read as a condition (rule 611.2b, 707): until a
 * permanent leaves (Secret Invasion), while one stays tapped (Zygon Infiltrator),
 * while an Equipment stays attached (Blade of Shared Souls, on the `becomes-attached`
 * trigger), until your next turn of a card (Taskmaster, The Animus); and what it
 * copies when that isn't a target: chosen as it resolves (Cytoshape, Polymorphous
 * Rush), or sacrificed as a cost (The Ever-Changing 'Dane).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  lands,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const copyOf = (game: Game, id: ObjectId): string | null => game.state.objects[id].copyOf;

describe("Zygon Infiltrator", () => {
  it("taps and stuns the target, and is a copy of it for as long as that creature stays tapped", () => {
    const { game } = table();
    const zygon = spawn(game, "Zygon Infiltrator");
    lands(game, "Island", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    activate(game, zygon, 0, { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].tapped).toBe(true);
    expect(counters(game, wurm, "stun")).toBe(1);
    expect(copyOf(game, zygon)).toBe("Craw Wurm");
    expect(pt(game, zygon)).toEqual({ power: 6, toughness: 4 });
    // Bob's untap step takes the stun counter off instead: still tapped.
    nextTurn(game);
    expect(game.state.objects[wurm].tapped).toBe(true);
    expect(copyOf(game, zygon)).toBe("Craw Wurm");
    // Alice's turn, then Bob's: it untaps at last.
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[wurm].tapped).toBe(false);
    expect(copyOf(game, zygon)).toBeNull();
    expect(pt(game, zygon)).toEqual({ power: 3, toughness: 2 });
  });

  it("it ends as that creature leaves too, and a sorcery timing is needed", () => {
    const { game } = table();
    const zygon = spawn(game, "Zygon Infiltrator");
    lands(game, "Island", 6);
    const wurm = spawn(game, "Craw Wurm", B);
    activate(game, zygon, 0, { targets: [ref(wurm)] });
    destroy(game, wurm);
    expect(copyOf(game, zygon)).toBeNull();
    nextTurn(game);
    expect(() => activate(game, zygon, 0, { targets: [ref(spawn(game, "Grizzly Bears", B))] })).toThrow();
  });
});

describe("Secret Invasion", () => {
  const invade = () => {
    const t = table();
    lands(t.game, "Island", 3);
    const mine = spawn(t.game, "Grizzly Bears");
    const wurm = spawn(t.game, "Craw Wurm", B);
    pickTargets(t.a, wurm);
    cast(t.game, toHand(t.game, "Secret Invasion"), { targets: [ref(mine)] });
    return { ...t, mine, wurm, aura: named(t.game, "Secret Invasion")[0] };
  };

  it("exiles the target and enchanted creature copies it until the Aura leaves; it comes back then", () => {
    const { game, mine, wurm, aura } = invade();
    expect(zone(game, wurm)).toBe("exile");
    expect(copyOf(game, mine)).toBe("Craw Wurm");
    expect(pt(game, mine)).toEqual({ power: 6, toughness: 4 });
    destroy(game, aura);
    settle(game);
    expect(copyOf(game, mine)).toBeNull();
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("can't target the creature it enchants, and may target nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const mine = spawn(game, "Grizzly Bears");
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered = legal[0] ?? [];
      return [null];
    };
    cast(game, toHand(game, "Secret Invasion"), { targets: [ref(mine)] });
    expect(JSON.stringify(offered)).not.toContain(JSON.stringify(mine));
    expect(copyOf(game, mine)).toBeNull();
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Blade of Shared Souls", () => {
  it("For Mirrodin! attaches it to a Rebel, and its trigger offers a copy that lasts while attached", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    pickTargets(a, wurm);
    pickModes(a, 0);
    const blade = enter(game, "Blade of Shared Souls");
    const rebel = game.state.objects[blade].attachedTo as ObjectId;
    expect(game.state.objects[rebel].cardName).toBe("Rebel Token");
    expect(copyOf(game, rebel)).toBe("Craw Wurm");
    // Moved off: the Rebel is itself again, and the new host may copy.
    lands(game, "Island", 2);
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a);
    activate(game, blade, 0, { targets: [ref(bear)] });
    expect(copyOf(game, rebel)).toBeNull();
    expect(copyOf(game, bear)).toBeNull();
  });

  it("locked in: what it copied can leave and it stays a copy (the ruling)", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    pickTargets(a, wurm);
    pickModes(a, 0);
    const blade = enter(game, "Blade of Shared Souls");
    const rebel = game.state.objects[blade].attachedTo as ObjectId;
    destroy(game, wurm);
    expect(copyOf(game, rebel)).toBe("Craw Wurm");
    destroy(game, blade);
    expect(copyOf(game, rebel)).toBeNull();
  });
});

describe("a copy of a card, until your next turn", () => {
  it("Taskmaster copies a graveyard card's printed values, keeping his name and types, until your next turn", () => {
    const { game, a } = table();
    const master = spawn(game, "Taskmaster, Mercenary Mimic");
    const card = toGraveyard(game, "Craw Wurm", B);
    pickTargets(a, card);
    nextTurn(game);
    pickTargets(a, card);
    nextTurn(game);
    settle(game);
    expect(copyOf(game, master)).toBe("Craw Wurm");
    expect(pt(game, master)).toEqual({ power: 6, toughness: 4 });
    expect(game.state.objects[master].modifiers.some((m) => m.copiable === true)).toBe(true);
    expect(subtypes(game, master)).toEqual(expect.arrayContaining(["Human", "Mercenary", "Villain"]));
    expect(subtypes(game, master)).not.toContain("Wurm");
  });

  it("Taskmaster: a card that died as a copy of something else is only its printed self (rule 400.7)", () => {
    const { game, a } = table();
    const master = spawn(game, "Taskmaster, Mercenary Mimic");
    const bear = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "become-copy", target: 0, of: 1 }, [ref(bear), ref(wurm)]);
    settle(game);
    expect(copyOf(game, bear)).toBe("Craw Wurm");
    destroy(game, bear);
    pickTargets(a, bear);
    nextTurn(game);
    pickTargets(a, bear);
    nextTurn(game);
    settle(game);
    expect(copyOf(game, master)).toBe("Grizzly Bears");
  });

  it("Taskmaster: a permanent's copiable values, and he's himself as your next turn begins, ready to do it again", () => {
    const { game, a } = table();
    const master = spawn(game, "Taskmaster, Mercenary Mimic");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    nextTurn(game);
    pickTargets(a, null);
    nextTurn(game);
    settle(game);
    // That first main's trigger had no target: until-your-next-turn ended before it.
    expect(copyOf(game, master)).toBeNull();
    pickTargets(a, wurm);
    nextTurn(game);
    expect(copyOf(game, master)).toBeNull();
    nextTurn(game);
    settle(game);
    expect(copyOf(game, master)).toBe("Craw Wurm");
    expect(pt(game, master)).toEqual({ power: 6, toughness: 4 });
    // He has the Wurm's text now: no trigger of his on the next main.
    nextTurn(game);
    expect(copyOf(game, master)).toBe("Craw Wurm");
    nextTurn(game);
    expect(copyOf(game, master)).toBeNull();
  });

  it("Taskmaster with no target stays himself", () => {
    const { game, a } = table();
    const master = spawn(game, "Taskmaster, Mercenary Mimic");
    pickTargets(a, null);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(copyOf(game, master)).toBeNull();
  });

  it("The Animus: a legendary creature you control copies a memory-counter card in exile until your next turn", () => {
    const { game, a } = table();
    const animus = spawn(game, "The Animus");
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const dead = toGraveyard(game, "Rhonas the Indomitable", B);
    pickTargets(a, dead);
    toStep(game, "end");
    settle(game);
    expect(zone(game, dead)).toBe("exile");
    expect(game.state.objects[dead].counters.memory).toBe(1);
    nextTurn(game);
    nextTurn(game);
    activate(game, animus, 0, { targets: [ref(legend), ref(dead)] });
    expect(copyOf(game, legend)).toBe("Rhonas the Indomitable");
    nextTurn(game);
    nextTurn(game);
    expect(copyOf(game, legend)).toBeNull();
  });

  it("The Animus: a card with no memory counter can't be the target", () => {
    const { game } = table();
    const animus = spawn(game, "The Animus");
    const legend = spawn(game, "Isamaru, Hound of Konda");
    const plain = toExile(game, "Craw Wurm", B);
    expect(() => activate(game, animus, 0, { targets: [ref(legend), ref(plain)] })).toThrow();
  });
});

describe("what it copies chosen as it resolves", () => {
  it("Cytoshape: a nonlegendary creature, chosen on resolution, until end of turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const bear = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    const seen = pickPermanents(a, wurm);
    cast(game, toHand(game, "Cytoshape"), { targets: [ref(bear)] });
    expect(seen.offered).not.toContain(legend);
    expect(copyOf(game, bear)).toBe("Craw Wurm");
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 4 });
    nextTurn(game);
    expect(copyOf(game, bear)).toBeNull();
  });

  it("Polymorphous Rush: strive pays per extra target, and each target copies the chosen creature", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Llanowar Elves");
    const wurm = spawn(game, "Craw Wurm", B);
    pickPermanents(a, wurm);
    cast(game, toHand(game, "Polymorphous Rush"), { targets: [ref(one), ref(two)] });
    expect(copyOf(game, one)).toBe("Craw Wurm");
    expect(copyOf(game, two)).toBe("Craw Wurm");
    nextTurn(game);
    expect(copyOf(game, one)).toBeNull();
  });
});

describe("The Ever-Changing 'Dane", () => {
  it("becomes a copy of what it sacrificed, keeping this ability", () => {
    const { game } = table();
    const dane = spawn(game, "The Ever-Changing 'Dane");
    lands(game, "Wastes", 2);
    const wurm = spawn(game, "Craw Wurm");
    const bear = spawn(game, "Grizzly Bears");
    const sacrificing = (id: ObjectId) =>
      game.dispatch({ type: "activate-ability", player: A, source: dane, abilityIndex: 0, targets: [], sacrifice: id });
    // Not itself.
    expect(() => sacrificing(dane)).toThrow();
    sacrificing(wurm);
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(copyOf(game, dane)).toBe("Craw Wurm");
    expect(pt(game, dane)).toEqual({ power: 6, toughness: 4 });
    // The ability's still there: again, on the other one.
    sacrificing(bear);
    settle(game);
    expect(copyOf(game, dane)).toBe("Grizzly Bears");
  });
});
