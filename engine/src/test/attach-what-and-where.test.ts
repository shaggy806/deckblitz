/**
 * Attachments as one effect: what's attached and where (`attachments.ts`,
 * docs/plans/need-key-themes.md, theme 14).
 */
import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  enter,
  keywords,
  lands,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat answers its choose-permanents in order. */
function answers(seat: ScriptedController, ...picks: readonly (readonly ObjectId[])[]): { offered: (readonly ObjectId[])[] } {
  const queue = [...picks];
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.choosePermanentsFn = (_view, eligible) => {
    seen.offered.push(eligible);
    return queue.shift() ?? [];
  };
  return seen;
}

const on = (game: ReturnType<typeof table>["game"], id: ObjectId) => game.state.objects[id].attachedTo;

describe("Akiri, Fearless Voyager: unattaching a chosen Equipment", () => {
  it("taps what it was on and makes that indestructible, the Equipment staying (rule 701.3d)", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const akiri = spawn(game, "Akiri, Fearless Voyager");
    const bears = spawn(game, "Grizzly Bears");
    const mace = spawn(game, "+2 Mace");
    activate(game, mace, 0, { targets: [ref(bears)] });
    expect(on(game, mace)).toBe(bears);
    answers(a, [mace]);
    activate(game, akiri, 0);
    expect(on(game, mace)).toBeNull();
    expect(zone(game, mace)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("declining taps nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const akiri = spawn(game, "Akiri, Fearless Voyager");
    const bears = spawn(game, "Grizzly Bears");
    const mace = spawn(game, "+2 Mace");
    activate(game, mace, 0, { targets: [ref(bears)] });
    answers(a, []);
    activate(game, akiri, 0);
    expect(on(game, mace)).toBe(bears);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Dragonfire Blade: priced by the creature it targets (rule 601.2f)", () => {
  it("costs {1} less per color, so a two-color creature can be equipped for {2}", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const blade = spawn(game, "Dragonfire Blade");
    const two = spawn(game, "Akiri, Fearless Voyager");
    activate(game, blade, 0, { targets: [ref(two)] });
    expect(on(game, blade)).toBe(two);
    expect(pt(game, two)).toEqual({ power: 5, toughness: 5 });
  });

  it("isn't offered on a one-color creature at that price", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const blade = spawn(game, "Dragonfire Blade");
    const mono = spawn(game, "Grizzly Bears");
    expect(() => activate(game, blade, 0, { targets: [ref(mono)] })).toThrow();
    expect(on(game, blade)).toBeNull();
  });
});

describe("Retether: Auras return onto creatures only", () => {
  it("each chosen as it enters, one that can't enchant a creature staying (rule 303.4g)", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    const curse = toGraveyard(game, "Curse of Silence");
    a.chooseEnchantFn = (_view, _source, options) => options[0];
    cast(game, toHand(game, "Retether"));
    expect(on(game, rancor)).toBe(bears);
    expect(zone(game, curse)).toBe("graveyard");
  });
});

describe("Maddening Hex: attaching to another opponent at random", () => {
  it("moves to the other opponent, never the one it's on, and deals the roll", () => {
    const { game } = table({ players: 3 });
    const hex = spawn(game, "Maddening Hex", B);
    game.state.objects[hex].attachedToPlayer = A;
    lands(game, "Wastes", 1);
    const before = game.state.players[A].life;
    cast(game, toHand(game, "Sol Ring"));
    expect(game.state.players[A].life).toBeLessThan(before);
    expect(game.state.objects[hex].attachedToPlayer).toBe(C);
  });

  it("stays put with one opponent (the ruling)", () => {
    const { game } = table();
    const hex = spawn(game, "Maddening Hex", B);
    game.state.objects[hex].attachedToPlayer = A;
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    expect(game.state.objects[hex].attachedToPlayer).toBe(A);
  });
});

describe("attaching to what this resolution created", () => {
  it("Cori-Steel Cutter: on the Monk if you choose it, or stays", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const cutter = spawn(game, "Cori-Steel Cutter");
    cast(game, toHand(game, "Sol Ring"));
    answers(a, []);
    cast(game, toHand(game, "Mox Jet"));
    expect(tokensNamed(game, "Monk Token")).toBe(1);
    expect(on(game, cutter)).toBeNull();
  });

  it("Cori-Steel Cutter: attached when chosen", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const cutter = spawn(game, "Cori-Steel Cutter");
    cast(game, toHand(game, "Sol Ring"));
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Mox Jet"));
    const [monk] = named(game, "Monk Token");
    expect(on(game, cutter)).toBe(monk);
    expect(pt(game, monk).power).toBeGreaterThanOrEqual(2);
  });

  it("Field-Tested Frying Pan: the Halfling, not the Food", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    const pan = enter(game, "Field-Tested Frying Pan");
    expect(tokensNamed(game, "Food Token")).toBe(1);
    const [halfling] = named(game, "Halfling Token");
    expect(on(game, pan)).toBe(halfling);
  });

  it("Fractal Harness: the 0/0 survives on its X counters", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const card = toHand(game, "Fractal Harness");
    cast(game, card, { x: 3 });
    const [fractal] = named(game, "Fractal Token");
    expect(on(game, card)).toBe(fractal);
    expect(game.state.objects[fractal].counters["+1/+1"]).toBe(3);
  });

  it("Goldwardens' Gambit: each token its own Equipment, never moved around (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const mace = spawn(game, "+2 Mace");
    const other = spawn(game, "Bonesplitter");
    const seen = { offered: [] as (readonly ObjectId[])[] };
    let picks = [mace, other];
    a.choosePermanentsFn = (_view, eligible) => {
      seen.offered.push(eligible);
      const next = picks.shift();
      return next === undefined ? [] : [next];
    };
    cast(game, toHand(game, "Goldwardens' Gambit"));
    picks = [];
    expect(tokensNamed(game, "Rebel Token")).toBe(5);
    expect(seen.offered[0]).toContain(mace);
    expect(seen.offered[1]).not.toContain(mace);
    const hosts = [on(game, mace), on(game, other)];
    expect(new Set(hosts).size).toBe(2);
    for (const host of hosts) expect(keywords(game, host as ObjectId).has("haste")).toBe(true);
  });
});

describe("Gilgamesh, Master-at-Arms: one of them on a Samurai", () => {
  it("chooses the Equipment and then the Samurai, by a reflexive trigger", () => {
    const { game, a } = table();
    const mace = toLibrary(game, "+2 Mace");
    const samurai = spawn(game, "Isao, Enlightened Bushi");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === mace);
    answers(a, [mace], [samurai]);
    enter(game, "Gilgamesh, Master-at-Arms");
    expect(zone(game, mace)).toBe("battlefield");
    expect(on(game, mace)).toBe(samurai);
  });
});

describe("becoming attached, seen from elsewhere", () => {
  it("Bramble Elemental: a spell's Aura counts as entering attached (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const elemental = spawn(game, "Bramble Elemental");
    cast(game, toHand(game, "Rancor"), { targets: [ref(elemental)] });
    expect(tokensNamed(game, "Saproling Token")).toBe(2);
  });

  it("Bramble Elemental: an Aura on another creature doesn't", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Bramble Elemental");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Rancor"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Saproling Token")).toBe(0);
  });

  it("Siona: your Aura on your creature, not on theirs", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Siona, Captain of the Pyleas");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rancor"), { targets: [ref(theirs)] });
    expect(tokensNamed(game, "Human Soldier Token")).toBe(0);
    cast(game, toHand(game, "Rancor"), { targets: [ref(mine)] });
    expect(tokensNamed(game, "Human Soldier Token")).toBe(1);
  });
});

describe("a group going on one chosen host", () => {
  it("Fumble: gained, then all on another creature, hexproof no bar (608.2c)", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const mace = spawn(game, "+2 Mace", B);
    const rancor = spawn(game, "Rancor", B);
    game.state.objects[mace].attachedTo = bears;
    game.state.objects[rancor].attachedTo = bears;
    const mine = spawn(game, "Hill Giant");
    a.choosePermanentsFn = (_view, eligible) => [eligible.includes(mine) ? mine : eligible[0]];
    void b;
    cast(game, toHand(game, "Fumble"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(on(game, mace)).toBe(mine);
    expect(on(game, rancor)).toBe(mine);
    expect(game.state.objects[mace].controller).toBe(A);
    expect(game.state.objects[rancor].controller).toBe(A);
  });

  it("Glamer Spinners: only permanents with the same controller, not the one it was on", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    const rancor = spawn(game, "Rancor", B);
    game.state.objects[rancor].attachedTo = bears;
    const seen = answers(a, [giant]);
    pickTargets(a, bears);
    enter(game, "Glamer Spinners");
    expect(on(game, rancor)).toBe(giant);
    expect(seen.offered[0]).not.toContain(bears);
    for (const id of seen.offered[0]) expect(game.state.objects[id].controller).toBe(B);
  });
});

describe("Armed with Proof: attaching reads the permanent as it is", () => {
  it("a Clue equips for {2} and gives +2/+0, and falls off when this leaves (704.5p)", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const armed = enter(game, "Armed with Proof");
    const [clue] = named(game, "Clue Token");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, clue, 1, { targets: [ref(bears)] });
    expect(on(game, clue)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    cast(game, toHand(game, "Disenchant"), { targets: [ref(armed)] });
    expect(on(game, clue)).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Darksteel Garrison: fortifying a land (rules 301.6, 702.67a)", () => {
  it("goes on a land, gives it indestructible, and pumps when it taps", () => {
    const { game, a } = table();
    const land = lands(game, "Plains", 3)[0];
    const garrison = spawn(game, "Darksteel Garrison");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, garrison, 0, { targets: [ref(land)] });
    expect(on(game, garrison)).toBe(land);
    expect(keywords(game, land).has("indestructible")).toBe(true);
    // Tapped by an effect, not for mana: the trigger is on becoming tapped.
    game.state.objects[land].tapped = false;
    a.chooseTargetsFn = () => [ref(bears)];
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(land)]);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("can't go on a creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const garrison = spawn(game, "Darksteel Garrison");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, garrison, 0, { targets: [ref(bears)] })).toThrow();
    expect(on(game, garrison)).toBeNull();
  });
});

describe("Steam Vines: the land's controller chooses where it goes", () => {
  it("destroys the land, deals 1, and moves on their pick", () => {
    const { game, b } = table();
    const land = spawn(game, "Forest", B);
    const other = spawn(game, "Swamp", B);
    const vines = spawn(game, "Steam Vines");
    game.state.objects[vines].attachedTo = land;
    const seen = answers(b, [other]);
    const life = game.state.players[B].life;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(land)]);
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(life - 1);
    expect(on(game, vines)).toBe(other);
    expect(seen.offered[0]).toContain(other);
  });
});

describe("Steam Vines with no other land", () => {
  it("goes to the graveyard for want of a host (rule 704.5m)", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    const vines = spawn(game, "Steam Vines");
    game.state.objects[vines].attachedTo = land;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(land)]);
    settle(game);
    expect(zone(game, vines)).toBe("graveyard");
  });
});

describe("the old attach shapes are gone", () => {
  it("no attach in the pool spells attachments, choose, ontoChosen, onto or attaching", () => {
    const old = ["attachments", "choose", "ontoChosen", "onto", "attaching"];
    const offenders: string[] = [];
    const visit = (value: unknown, card: string): void => {
      if (Array.isArray(value)) {
        for (const item of value) visit(item, card);
      } else if (typeof value === "object" && value !== null) {
        const object = value as Record<string, unknown>;
        if (object["kind"] === "attach" && old.some((key) => key in object)) offenders.push(card);
        for (const item of Object.values(object)) visit(item, card);
      }
    };
    for (const def of POOL_CARDS) visit(def, def.name);
    expect(offenders).toEqual([]);
  });
});
