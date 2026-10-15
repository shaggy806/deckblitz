/**
 * Set walk batch 78, part b (2026-10-15): Lorwyn Eclipsed (ECL), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** `who`'s cast offers for `card`. */
function castOffers(game: Game, card: ObjectId, who = A) {
  return game.legalActions(who).filter((o) => o.kind === "cast-spell" && o.card === card);
}

describe("Boldwyr Aggressor", () => {
  it("has double strike and gives your other Giants double strike, not other creatures or an opponent's Giants", () => {
    const { game } = table();
    const aggressor = spawn(game, "Boldwyr Aggressor");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    expect(keywords(game, aggressor).has("double-strike")).toBe(true);
    expect(keywords(game, giant).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    expect(keywords(game, theirs).has("double-strike")).toBe(false);
  });
});

describe("Barbed Bloodletter", () => {
  it("attaches to the target as it enters; the creature gets +1/+2 and wither until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const bloodletter = enter(game, "Barbed Bloodletter");
    expect(game.state.objects[bloodletter].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("wither")).toBe(true);
    toStep(game, "upkeep", B);
    expect(keywords(game, bears).has("wither")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
  });

  it("the wither applies to the damage Assert Perfection has it deal (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Ancient Brontodon", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Barbed Bloodletter"));
    cast(game, toHand(game, "Assert Perfection"), { targets: [ref(bears), ref(wurm)] });
    // 2 + 1 (Bloodletter) + 1 (Assert Perfection) = 4, as -1/-1 counters.
    expect(counters(game, wurm, "-1/-1")).toBe(4);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });

  it("equips for {2}", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const bloodletter = spawn(game, "Barbed Bloodletter");
    activate(game, bloodletter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bloodletter].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("wither")).toBe(false);
  });
});

describe("Brigid's Command", () => {
  it("copies a Kithkin you control and has target player create a Kithkin", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    const harrier = spawn(game, "Goldmeadow Harrier");
    cast(game, toHand(game, "Brigid's Command"), { modes: [0, 1], targets: [ref(harrier), ref(B)] });
    expect(named(game, "Goldmeadow Harrier", A)).toHaveLength(2);
    expect(tokensNamed(game, "Kithkin Token", B)).toBe(1);
    expect(tokensNamed(game, "Kithkin Token", A)).toBe(0);
  });

  it("pumps first, then fights", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Brigid's Command"), { modes: [2, 3], targets: [ref(bears), ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("is two modes, never one", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Brigid's Command"), { modes: [2], targets: [ref(bears)] })).toThrow();
  });
});

describe("Pestered Wellguard", () => {
  it("makes a 1/1 Faerie when it becomes tapped", () => {
    const { game, a } = table();
    const wellguard = spawn(game, "Pestered Wellguard");
    attack(game, a, [wellguard]);
    expect(tokensNamed(game, "Blue-Black Faerie Token", A)).toBe(1);
  });
});

describe("Wanderbrine Preacher", () => {
  it("gains 2 life when it becomes tapped", () => {
    const { game, a } = table();
    const preacher = spawn(game, "Wanderbrine Preacher");
    attack(game, a, [preacher]);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });
});

describe("Vinebred Brawler", () => {
  it("pumps another Elf you control +2/+1 as it attacks — never itself", () => {
    const { game, a } = table();
    const brawler = spawn(game, "Vinebred Brawler");
    const elves = spawn(game, "Llanowar Elves");
    const other = spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    // An opponent's Elf, tapped so the Brawler needn't be blocked.
    spawn(game, "Llanowar Elves", B, { tapped: true });
    const seen = watchTargets(a, (offered) => offered.map(() => elves));
    attack(game, a, [brawler]);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([elves, other].sort());
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, other)).toEqual({ power: 1, toughness: 1 });
  });

  it("must be blocked if able", () => {
    const { game, a } = table();
    const brawler = spawn(game, "Vinebred Brawler");
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [brawler]);
    expect(offer.mustBeBlockedIfAble).toEqual([brawler]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: [] })).toThrow(/must be blocked/);
  });
});

describe("Dose of Dawnglow", () => {
  it("in your main phase it returns the creature and doesn't blight", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Dose of Dawnglow"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "-1/-1")).toBe(0);
  });

  it("outside your main phase it blights 2 after the return — the returned creature may be the one", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    toStep(game, "end");
    const seen = pickPermanents(a, giant);
    cast(game, toHand(game, "Dose of Dawnglow"), { targets: [ref(giant)] });
    expect(seen.offered).toContain(giant);
    expect(seen.offered).toContain(bears);
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "-1/-1")).toBe(2);
    expect(counters(game, bears, "-1/-1")).toBe(0);
  });

  it("in an opponent's main phase it blights too", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = toGraveyard(game, "Hill Giant");
    toStep(game, "precombat-main", B);
    game.state.priority.holder = A;
    cast(game, toHand(game, "Dose of Dawnglow"), { targets: [ref(giant)] });
    expect(counters(game, giant, "-1/-1")).toBe(2);
  });
});

describe("Deepchannel Duelist", () => {
  it("gives your other Merfolk +1/+1, not itself or an opponent's", () => {
    const { game } = table();
    const duelist = spawn(game, "Deepchannel Duelist");
    const looter = spawn(game, "Merfolk Looter");
    const theirs = spawn(game, "Merfolk Looter", B);
    expect(pt(game, duelist)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, looter)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });

  it("untaps target Merfolk you control at the beginning of your end step", () => {
    const { game, a } = table();
    spawn(game, "Deepchannel Duelist");
    const looter = spawn(game, "Merfolk Looter", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    const seen = watchTargets(a, () => [looter]);
    toStep(game, "end");
    settle(game);
    expect(seen.offered[0]).not.toContain(named(game, "Grizzly Bears")[0]);
    expect(game.state.objects[looter].tapped).toBe(false);
  });
});

describe("Assert Perfection", () => {
  it("pumps the creature, then it deals damage equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Assert Perfection"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("with no second target it only pumps", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Assert Perfection"), { targets: [ref(bears), null] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });
});

describe("Cinder Strike", () => {
  it("deals 2 damage without the blight", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Cinder Strike"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("blighting 1 makes it 4, and the blight is offered only with a creature to blight", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const strike = toHand(game, "Cinder Strike");
    const wurm = spawn(game, "Ancient Brontodon", B);
    expect(castOffers(game, strike).some((o) => o.kind === "cast-spell" && o.kicked === true)).toBe(false);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, strike, { kicked: true, targets: [ref(wurm)] });
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(game.state.objects[wurm].damageMarked).toBe(4);
  });
});

describe("Pyrrhic Strike", () => {
  it("without the blight, one mode", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const ring = spawn(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant", B);
    const strike = toHand(game, "Pyrrhic Strike");
    expect(() => cast(game, strike, { modes: [0, 1], targets: [ref(ring), ref(giant)] })).toThrow();
    cast(game, strike, { modes: [1], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("blighting 2 chooses both modes", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const ring = spawn(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    pickPermanents(a, mine);
    cast(game, toHand(game, "Pyrrhic Strike"), { kicked: true, modes: [0, 1], targets: [ref(ring), ref(giant)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, mine, "-1/-1")).toBe(2);
  });

  it("only a creature with mana value 3 or greater", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const strike = toHand(game, "Pyrrhic Strike");
    expect(() => cast(game, strike, { modes: [1], targets: [ref(bears)] })).toThrow();
  });
});

describe("Eclipsed Kithkin", () => {
  it("may take a Kithkin, Forest or Plains card from the top four; the rest go to the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const plains = toLibrary(game, "Plains");
    const forest = toLibrary(game, "Forest");
    const harrier = toLibrary(game, "Goldmeadow Harrier");
    const seen = pickFromZone(a, forest);
    enter(game, "Eclipsed Kithkin");
    expect([...seen.offered].sort()).toEqual([harrier, forest, plains].sort());
    expect(seen.offered).not.toContain(bears);
    expect(hand(game)).toContain(forest);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([harrier, plains, bears].sort());
  });
});

describe("Safewright Cavalry", () => {
  it("can't be blocked by more than one creature", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Safewright Cavalry");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [cavalry]);
    expect(() =>
      game.dispatch({
        type: "declare-blockers",
        player: B,
        blocks: [
          { blocker: one, attacker: cavalry },
          { blocker: two, attacker: cavalry },
        ],
      }),
    ).toThrow();
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: one, attacker: cavalry }] });
    expect(game.state.objects[one].blocking).toBe(cavalry);
  });

  it("{5}: target Elf you control gets +2/+2", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const cavalry = spawn(game, "Safewright Cavalry");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Llanowar Elves", B);
    expect(() => activate(game, cavalry, 0, { targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, cavalry, 0, { targets: [ref(theirs)] })).toThrow();
    activate(game, cavalry, 0, { targets: [ref(elves)] });
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Thoughtweft Lieutenant", () => {
  it("pumps a creature you control as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Thoughtweft Lieutenant");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("and whenever another Kithkin you control enters — not another creature, nor an opponent's Kithkin", () => {
    const { game, a } = table();
    const lieutenant = spawn(game, "Thoughtweft Lieutenant");
    pickTargets(a, lieutenant);
    enter(game, "Grizzly Bears");
    enter(game, "Goldmeadow Harrier", B);
    expect(pt(game, lieutenant)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Goldmeadow Harrier");
    expect(pt(game, lieutenant)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, lieutenant).has("trample")).toBe(true);
  });
});

describe("Evershrike's Gift", () => {
  it("gives the enchanted creature +1/+0 and flying", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Evershrike's Gift"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("{1}{W}, blight 2: returns from the graveyard to hand, only with a creature to blight", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const gift = toGraveyard(game, "Evershrike's Gift");
    expect(() => activate(game, gift, 0)).toThrow();
    const giant = spawn(game, "Hill Giant");
    activate(game, gift, 0);
    expect(hand(game)).toContain(gift);
    expect(graveyard(game)).not.toContain(gift);
    expect(counters(game, giant, "-1/-1")).toBe(2);
  });

  it("only as a sorcery", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Hill Giant");
    const gift = toGraveyard(game, "Evershrike's Gift");
    toStep(game, "end");
    expect(() => activate(game, gift, 0)).toThrow();
  });
});
