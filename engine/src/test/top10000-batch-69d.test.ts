/**
 * Card batch 69, part d (2026-10-12): the `become-copy` cards — permanents
 * that become copies of a permanent, a card or a spell, for a duration or
 * for good, with "except it has this ability". Written on the shared table
 * in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf, printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const copyOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("Mirage Mirror", () => {
  it("becomes a copy of a creature until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mirror = spawn(game, "Mirage Mirror");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, mirror, 0, { targets: [ref(giant)] });
    expect(types(game, mirror)).toEqual(["creature"]);
    expect(pt(game, mirror)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(types(game, mirror)).toEqual(["artifact"]);
  });
});

describe("Thespian's Stage", () => {
  it("becomes a copy of a land for good, with the copy ability and not {T}: Add {C}", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const stage = spawn(game, "Thespian's Stage");
    const forest = spawn(game, "Forest", B);
    activate(game, stage, 1, { targets: [ref(forest)] });
    expect(copyOf(game, stage)).toBe("Forest");
    expect(subtypes(game, stage)).toContain("Forest");
    expect(game.state.objects[stage].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(copyOf(game, stage)).toBe("Forest");
    // As a Forest: its {T}: Add {G}, then this ability.
    const swamp = spawn(game, "Swamp", B);
    activate(game, stage, 1, { targets: [ref(swamp)] });
    expect(copyOf(game, stage)).toBe("Swamp");
  });

  it("a land copying it has the ability too (a copiable value — rule 707.9a)", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const stage = spawn(game, "Thespian's Stage");
    activate(game, stage, 1, { targets: [ref(spawn(game, "Forest", B))] });
    const other = spawn(game, "Thespian's Stage");
    activate(game, other, 1, { targets: [ref(stage)] });
    expect(copyOf(game, other)).toBe("Forest");
    game.state.objects[other].tapped = false;
    activate(game, other, 1, { targets: [ref(spawn(game, "Island", B))] });
    expect(copyOf(game, other)).toBe("Island");
  });
});

describe("The Mycosynth Gardens", () => {
  it("becomes a copy of a nontoken artifact you control with mana value X", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const gardens = spawn(game, "The Mycosynth Gardens");
    const stone = spawn(game, "Mind Stone");
    expect(() => activate(game, gardens, 2, { x: 1, targets: [ref(stone)] })).toThrow();
    activate(game, gardens, 2, { x: 2, targets: [ref(stone)] });
    expect(copyOf(game, gardens)).toBe("Mind Stone");
    expect(types(game, gardens)).toEqual(["artifact"]);
    nextTurn(game);
    expect(copyOf(game, gardens)).toBe("Mind Stone");
  });
});

describe("Shuri, Wakandan Inventor", () => {
  it("makes an artifact a nonlegendary copy of another until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const shuri = spawn(game, "Shuri, Wakandan Inventor");
    const ring = spawn(game, "Sol Ring");
    const mox = spawn(game, "Mox Amber");
    activate(game, shuri, 0, { targets: [ref(ring), ref(mox)] });
    expect(copyOf(game, ring)).toBe("Mox Amber");
    expect(supertypes(game, ring)).toEqual([]);
    // Two Mox Ambers, one not legendary: the legend rule leaves both.
    expect(zone(game, mox)).toBe("battlefield");
    nextTurn(game);
    expect(copyOf(game, ring)).toBe("Sol Ring");
  });

  it("makes artifact spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "Shuri, Wakandan Inventor");
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Mind Stone"));
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Mind Stone")).toBe(true);
  });
});

describe("Irma, Part-Time Mutant", () => {
  it("becomes a copy keeping her name and this ability, then gets a counter — and does it again next turn", () => {
    const { game, a } = table();
    const irma = spawn(game, "Irma, Part-Time Mutant");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(copyOf(game, irma)).toBe("Hill Giant");
    expect(nameOf(game.state.objects[irma])).toBe("Irma, Part-Time Mutant");
    expect(supertypes(game, irma)).toEqual([]);
    expect(pt(game, irma)).toEqual({ power: 4, toughness: 4 });
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    nextTurn(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(copyOf(game, irma)).toBe("Grizzly Bears");
    expect(counters(game, irma)).toBe(2);
    expect(pt(game, irma)).toEqual({ power: 4, toughness: 4 });
  });

  it("with no target, only gets the counter", () => {
    const { game, a } = table();
    const irma = spawn(game, "Irma, Part-Time Mutant");
    pickTargets(a, null);
    toStep(game, "begin-combat");
    settle(game);
    expect(copyOf(game, irma)).toBe("Irma, Part-Time Mutant");
    expect(counters(game, irma)).toBe(1);
  });
});

describe("Kimahri, Valiant Guardian", () => {
  it("puts a counter on itself, taps the opponent's creature and may become a copy with vigilance and this ability", () => {
    const { game, a } = table();
    const kimahri = spawn(game, "Kimahri, Valiant Guardian");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, dreadmaw);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[dreadmaw].tapped).toBe(true);
    expect(copyOf(game, kimahri)).toBe("Colossal Dreadmaw");
    expect(nameOf(game.state.objects[kimahri])).toBe("Kimahri, Valiant Guardian");
    expect(keywords(game, kimahri).has("vigilance")).toBe(true);
    expect(keywords(game, kimahri).has("trample")).toBe(true);
    // The counter went on before the copy and stays: a 6/6 with one.
    expect(pt(game, kimahri)).toEqual({ power: 7, toughness: 7 });
    // "This ability" came with it: next turn it fires again.
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, kimahri)).toBe(2);
    expect(copyOf(game, kimahri)).toBe("Colossal Dreadmaw");
  });
});

describe("Sunfrill Imitator", () => {
  it("attacking, may become a copy of another Dinosaur named Sunfrill Imitator, keeping this ability", () => {
    const { game, a } = table();
    const imitator = spawn(game, "Sunfrill Imitator");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    pickTargets(a, dreadmaw);
    pickModes(a, 0);
    attack(game, a, [imitator]);
    expect(copyOf(game, imitator)).toBe("Colossal Dreadmaw");
    expect(nameOf(game.state.objects[imitator])).toBe("Sunfrill Imitator");
    expect(keywords(game, imitator).has("trample")).toBe(true);
    // 6 combat damage as the 6/6 it became.
    expect(game.state.players[B].life).toBe(14);
    nextTurn(game);
    nextTurn(game);
    expect(copyOf(game, imitator)).toBe("Colossal Dreadmaw");
  });
});

describe("Mirrorform", () => {
  it("makes each nonland permanent you control a copy of the target, for good", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Mirrorform"), { targets: [ref(giant)] });
    expect(copyOf(game, bears)).toBe("Hill Giant");
    expect(copyOf(game, ring)).toBe("Hill Giant");
    expect(copyOf(game, theirs)).toBe("Grizzly Bears");
    expect(game.battlefield.filter((id) => copyOf(game, id) === "Island")).toHaveLength(6);
    nextTurn(game);
    expect(copyOf(game, ring)).toBe("Hill Giant");
  });
});

describe("Loki, Lord of Misrule", () => {
  it("makes each other creature you control a nonlegendary copy of the chosen one, Loki too", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const loki = spawn(game, "Loki, Lord of Misrule");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, loki, 0, { targets: [ref(giant)] });
    expect(copyOf(game, loki)).toBe("Hill Giant");
    expect(copyOf(game, bears)).toBe("Hill Giant");
    expect(copyOf(game, giant)).toBe("Hill Giant");
    expect(copyOf(game, theirs)).toBe("Grizzly Bears");
    nextTurn(game);
    expect(copyOf(game, loki)).toBe("Loki, Lord of Misrule");
    expect(supertypes(game, loki)).toEqual(["legendary"]);
  });
});

describe("Nanogene Conversion", () => {
  it("makes every other creature a copy until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Nanogene Conversion"), { targets: [ref(giant)] });
    expect(copyOf(game, theirs)).toBe("Hill Giant");
    nextTurn(game);
    expect(copyOf(game, theirs)).toBe("Grizzly Bears");
  });
});

describe("Likeness Looter", () => {
  it("becomes a copy of a creature card in your graveyard with mana value X, with flying and the ability", () => {
    const { game } = table();
    lands(game, "Wastes", 8);
    const looter = spawn(game, "Likeness Looter");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, looter, 1, { x: 3, targets: [ref(giant)] })).toThrow();
    activate(game, looter, 1, { x: 4, targets: [ref(giant)] });
    expect(copyOf(game, looter)).toBe("Hill Giant");
    expect(keywords(game, looter).has("flying")).toBe(true);
    expect(pt(game, looter)).toEqual({ power: 3, toughness: 3 });
    // Its loot ability is gone; the copy ability is its only one now.
    activate(game, looter, 0, { x: 2, targets: [ref(bears)] });
    expect(copyOf(game, looter)).toBe("Grizzly Bears");
    expect(keywords(game, looter).has("flying")).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("loots", () => {
    const { game } = table();
    const looter = spawn(game, "Likeness Looter");
    const before = hand(game).length;
    activate(game, looter, 0);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Shifting Woodland", () => {
  it("with delirium, becomes a copy of a permanent card in your graveyard until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const woodland = spawn(game, "Shifting Woodland");
    const giant = toGraveyard(game, "Hill Giant");
    expect(() => activate(game, woodland, 1, { targets: [ref(giant)] })).toThrow();
    toGraveyard(game, "Forest");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    activate(game, woodland, 1, { targets: [ref(giant)] });
    expect(copyOf(game, woodland)).toBe("Hill Giant");
    expect(types(game, woodland)).toEqual(["creature"]);
    nextTurn(game);
    expect(copyOf(game, woodland)).toBe("Shifting Woodland");
  });

  it("enters tapped unless you control a Forest", () => {
    const { game } = table();
    const first = enter(game, "Shifting Woodland");
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Forest");
    const second = enter(game, "Shifting Woodland");
    expect(game.state.objects[second].tapped).toBe(false);
  });
});

describe("Lazav, Dimir Mastermind", () => {
  it("may become a copy of a creature card put into an opponent's graveyard, keeping his name, legendary, hexproof and the ability", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Dimir Mastermind");
    pickModes(a, 0);
    destroy(game, spawn(game, "Hill Giant", B));
    expect(copyOf(game, lazav)).toBe("Hill Giant");
    expect(nameOf(game.state.objects[lazav])).toBe("Lazav, Dimir Mastermind");
    expect(supertypes(game, lazav)).toEqual(["legendary"]);
    expect(keywords(game, lazav).has("hexproof")).toBe(true);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(copyOf(game, lazav)).toBe("Grizzly Bears");
  });

  it("copies the card, not what the permanent copied: a dead Clone makes him a 0/0", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Dimir Mastermind");
    const clone = spawn(game, "Clone", B);
    game.state.objects[clone].copyOf = "Hill Giant";
    pickModes(a, 0);
    destroy(game, clone);
    expect(zone(game, lazav)).toBe("graveyard");
  });

  it("copies the card as it last existed in the graveyard, though it has become a permanent since (the ruling)", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Dimir Mastermind");
    const giant = spawn(game, "Hill Giant", B);
    // As Lazav's ability resolves, the card is back on the battlefield — as
    // a copy of Grizzly Bears.
    a.chooseModesFn = () => {
      game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0 }, [ref(giant)]);
      game.state.objects[giant].copyOf = "Grizzly Bears";
      return [0];
    };
    destroy(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(copyOf(game, lazav)).toBe("Hill Giant");
  });

  it("doesn't see your own creature cards", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Dimir Mastermind");
    pickModes(a, 0);
    destroy(game, spawn(game, "Hill Giant"));
    expect(copyOf(game, lazav)).toBe("Lazav, Dimir Mastermind");
  });
});

describe("Court of Vantress", () => {
  it("as the monarch, may create a token copy of another artifact or enchantment", () => {
    const { game, a } = table();
    enter(game, "Court of Vantress");
    expect(game.state.monarch).toBe(A);
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, ring);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(game.battlefield.filter((id) => copyOf(game, id) === "Sol Ring")).toHaveLength(2);
  });

  it("not the monarch, may become a copy of it, keeping this ability", () => {
    const { game, a } = table();
    const court = spawn(game, "Court of Vantress");
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    game.state.monarch = B;
    pickTargets(a, ring);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(copyOf(game, court)).toBe("Sol Ring");
    // Next upkeep the copy's own ability triggers again.
    pickTargets(a, stone);
    toStep(game, "upkeep");
    settle(game);
    expect(copyOf(game, court)).toBe("Mind Stone");
  });
});

describe("Naga Fleshcrafter", () => {
  it("renew: a counter on the target and each other creature you control copies it until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const naga = toGraveyard(game, "Naga Fleshcrafter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    activate(game, naga, 0, { targets: [ref(bears)] });
    expect(zone(game, naga)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
    expect(copyOf(game, giant)).toBe("Grizzly Bears");
    // Not the counter: a plain 2/2.
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(copyOf(game, theirs)).toBe("Hill Giant");
    nextTurn(game);
    expect(copyOf(game, giant)).toBe("Hill Giant");
  });
});

describe("Brudiclad, Telchor Engineer", () => {
  it("makes a Myr, then each other token you control becomes a copy of the chosen one — for good, with haste", () => {
    const { game, a } = table();
    spawn(game, "Brudiclad, Telchor Engineer");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    const treasure = game.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token")!;
    a.choosePermanentsFn = (_view, eligible) =>
      eligible.filter((id) => game.state.objects[id].cardName === "Phyrexian Myr Token");
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Phyrexian Myr Token")).toBe(1);
    expect(copyOf(game, treasure)).toBe("Phyrexian Myr Token");
    expect(pt(game, treasure)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, treasure).has("haste")).toBe(true);
    nextTurn(game);
    expect(copyOf(game, treasure)).toBe("Phyrexian Myr Token");
  });

  it("choosing nothing changes nothing", () => {
    const { game, a } = table();
    spawn(game, "Brudiclad, Telchor Engineer");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    pickPermanents(a);
    toStep(game, "begin-combat");
    settle(game);
    const treasure = game.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token")!;
    expect(copyOf(game, treasure)).toBe("Treasure Token");
  });
});

describe("Niko, Light of Hope", () => {
  it("exiles a creature, the Shards copy it until the next end step, and it returns then", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const niko = enter(game, "Niko, Light of Hope");
    const shards = game.battlefield.filter((id) => game.state.objects[id].cardName === "Shard Token");
    expect(shards.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    activate(game, niko, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    for (const shard of shards) {
      expect(copyOf(game, shard)).toBe("Hill Giant");
      // Not the counter it had.
      expect(pt(game, shard)).toEqual({ power: 3, toughness: 3 });
    }
    toStep(game, "end");
    settle(game);
    for (const shard of shards) expect(copyOf(game, shard)).toBe("Shard Token");
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("can't take a legendary creature", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const niko = spawn(game, "Niko, Light of Hope");
    const loki = spawn(game, "Loki, Lord of Misrule");
    expect(() => activate(game, niko, 0, { targets: [ref(loki)] })).toThrow();
  });
});

describe("Silent Hallcreeper", () => {
  it("chooses a mode that hasn't been chosen each time, the last making it a copy", () => {
    const { game, a } = table();
    const creeper = spawn(game, "Silent Hallcreeper");
    const giant = spawn(game, "Hill Giant");
    let offered: readonly string[] = [];
    const choose = (prefix: string): void => {
      a.chooseModesFn = (_view, _min, _max, texts) => {
        offered = texts;
        return [texts.findIndex((t) => t.startsWith(prefix))];
      };
    };
    choose("Put two");
    attack(game, a, [creeper]);
    expect(counters(game, creeper)).toBe(2);
    expect(offered).toHaveLength(3);
    toStep(game, "precombat-main");
    const before = hand(game).length;
    choose("Draw");
    attack(game, a, [creeper]);
    expect(offered).toHaveLength(2);
    expect(offered.some((t) => t.startsWith("Put two"))).toBe(false);
    expect(hand(game).length).toBe(before + 1);
    choose("This creature");
    pickTargets(a, giant);
    attack(game, a, [creeper]);
    expect(offered).toHaveLength(1);
    expect(copyOf(game, creeper)).toBe("Hill Giant");
    expect(pt(game, creeper)).toEqual({ power: 5, toughness: 5 });
  });

  it("a Hallcreeper that comes back is a new object with every mode again (rule 400.7)", () => {
    const { game, a } = table();
    const creeper = spawn(game, "Silent Hallcreeper");
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [texts.findIndex((t) => t.startsWith("Draw"))];
    };
    attack(game, a, [creeper]);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(creeper)]);
    settle(game);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Silent Hallcreeper")!;
    game.state.objects[back].summoningSick = false;
    offered = [];
    attack(game, a, [back]);
    // No other creature to copy, so not the copy mode (rule 603.3c) — but
    // "Draw a card", chosen by the Hallcreeper that left, is offered again.
    expect(offered).toHaveLength(2);
    expect(offered.some((t) => t.startsWith("Draw"))).toBe(true);
  });
});

describe("Shard Token", () => {
  it("{2}, sacrifice: scry 1, then draw", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    enter(game, "Niko, Light of Hope");
    const shard = game.battlefield.find((id) => game.state.objects[id].cardName === "Shard Token")!;
    const before = hand(game).length;
    activate(game, shard, 0);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});
