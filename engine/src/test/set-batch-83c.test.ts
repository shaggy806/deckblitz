/**
 * Set walk batch 83, part c (2026-10-16): Tarkir: Dragonstorm (TDM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
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

const SPIRIT_1 = "Spirit Token (Great Arashin City)";
const SPIRIT_2 = "Spirit Token (Anafenza, Unyielding Lineage)";
const SPIRIT_3 = "Spirit Token (Dusyut Earthcarver)";

/** Answer each modes question in turn with the next of `answers`. */
function modesInOrder(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  let i = 0;
  seat.chooseModesFn = () => [...(answers[Math.min(i++, answers.length - 1)] ?? [])];
}

describe("Trade Route Envoy", () => {
  it("draws a card if you control a creature with a counter on it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { stun: 1 };
    const before = hand(game).length;
    const envoy = enter(game, "Trade Route Envoy");
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, envoy)).toBe(0);
  });

  it("puts a +1/+1 counter on itself instead when you don't draw — an opponent's countered creature doesn't count", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters = { "+1/+1": 1 };
    const before = hand(game).length;
    const envoy = enter(game, "Trade Route Envoy");
    expect(hand(game).length).toBe(before);
    expect(counters(game, envoy)).toBe(1);
    expect(pt(game, envoy)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Descendant of Storms", () => {
  it("attacking, you may pay {1}{W} to endure 1 — counter or a 1/1 Spirit", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const descendant = spawn(game, "Descendant of Storms");
    modesInOrder(a, [0], [0]);
    attack(game, a, [descendant]);
    expect(counters(game, descendant)).toBe(1);
    expect(life(game, B)).toBe(17);

    nextTurn(game);
    nextTurn(game);
    modesInOrder(a, [0], [1]);
    attack(game, a, [descendant]);
    expect(counters(game, descendant)).toBe(1);
    expect(tokensNamed(game, SPIRIT_1, A)).toBe(1);
  });

  it("declining the payment does nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const descendant = spawn(game, "Descendant of Storms");
    pickModes(a);
    attack(game, a, [descendant]);
    expect(counters(game, descendant)).toBe(0);
    expect(tokensNamed(game, SPIRIT_1, A)).toBe(0);
  });
});

describe("Rescue Leopard", () => {
  it("becoming tapped, you may discard a card to draw a card", () => {
    const { game, a } = table();
    const leopard = spawn(game, "Rescue Leopard");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [leopard]);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Loxodon Battle Priest", () => {
  it("at the beginning of combat on your turn, puts a +1/+1 counter on another creature you control", () => {
    const { game } = table();
    const priest = spawn(game, "Loxodon Battle Priest");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, priest)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });

  it("offers your other creatures only, never itself", () => {
    const { game, a } = table();
    spawn(game, "Loxodon Battle Priest");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, (offered) => offered.map(() => giant));
    toStep(game, "declare-attackers");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(counters(game, giant)).toBe(1);
  });

  it("with no other creature you control, does nothing", () => {
    const { game } = table();
    const priest = spawn(game, "Loxodon Battle Priest");
    toStep(game, "declare-attackers");
    settle(game);
    expect(counters(game, priest)).toBe(0);
  });
});

describe("Sibsig Appraiser", () => {
  it("puts one of the top two cards into your hand and the other into your graveyard", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bolt);
    enter(game, "Sibsig Appraiser");
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Clan Monuments", () => {
  it("Jeskai Monument fetches a basic Island, Mountain or Plains, and sacrifices for two 1/1 flying Birds at sorcery speed", () => {
    const { game, a } = table();
    const swamp = toLibrary(game, "Swamp");
    const island = toLibrary(game, "Island");
    const seen = pickFromZone(a, island);
    lands(game, "Wastes", 2);
    const monument = toHand(game, "Jeskai Monument");
    cast(game, monument);
    expect(seen.offered).toContain(island);
    expect(seen.offered).not.toContain(swamp);
    expect(zone(game, island)).toBe("hand");
    spawn(game, "Island");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    spawn(game, "Wastes");
    activate(game, monument);
    expect(zone(game, monument)).toBe("graveyard");
    expect(tokensNamed(game, "Bird Token", A)).toBe(2);
    const [bird] = named(game, "Bird Token");
    expect(keywords(game, bird).has("flying")).toBe(true);
  });

  it("Temur Monument fetches a basic Forest, Island or Mountain, and makes a 5/5 Elephant", () => {
    const { game, a } = table();
    const plains = toLibrary(game, "Plains");
    const forest = toLibrary(game, "Forest");
    const seen = pickFromZone(a, forest);
    lands(game, "Wastes", 2);
    const monument = toHand(game, "Temur Monument");
    cast(game, monument);
    expect(seen.offered).not.toContain(plains);
    expect(zone(game, forest)).toBe("hand");
    spawn(game, "Forest");
    spawn(game, "Island");
    spawn(game, "Mountain");
    lands(game, "Wastes", 3);
    activate(game, monument);
    const [elephant] = named(game, "5/5 Elephant Token");
    expect(pt(game, elephant)).toEqual({ power: 5, toughness: 5 });
  });

  it("Sultai Monument fetches a basic Swamp, Forest or Island, and makes two 2/2 Zombie Druids — not at instant speed", () => {
    const { game, a } = table();
    const mountain = toLibrary(game, "Mountain");
    const swamp = toLibrary(game, "Swamp");
    const seen = pickFromZone(a, swamp);
    lands(game, "Wastes", 2);
    const monument = toHand(game, "Sultai Monument");
    cast(game, monument);
    expect(seen.offered).not.toContain(mountain);
    expect(zone(game, swamp)).toBe("hand");
    spawn(game, "Swamp");
    spawn(game, "Forest");
    spawn(game, "Island");
    lands(game, "Wastes", 2);
    nextTurn(game);
    expect(() => activate(game, monument)).toThrow();
    nextTurn(game);
    activate(game, monument);
    expect(tokensNamed(game, "Zombie Druid Token", A)).toBe(2);
  });
});

describe("Poised Practitioner", () => {
  it("flurry: your second spell each turn gives it a +1/+1 counter and scries 1", () => {
    const { game, a } = table();
    const practitioner = spawn(game, "Poised Practitioner");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, practitioner)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, practitioner)).toBe(1);
    expect(scried).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, practitioner)).toBe(1);
  });
});

describe("Yathan Roadwatcher", () => {
  it("cast, it mills four and returns a creature card with mana value 3 or less", () => {
    const { game } = table();
    const giant = toLibrary(game, "Craw Wurm");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    spawn(game, "Plains");
    spawn(game, "Swamp");
    spawn(game, "Forest");
    spawn(game, "Wastes");
    cast(game, toHand(game, "Yathan Roadwatcher"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("put onto the battlefield without being cast, it does nothing", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    enter(game, "Yathan Roadwatcher");
    expect(zone(game, bears)).toBe("library");
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Abzan Devotee", () => {
  it("adds one mana of {W}, {B} or {G} once each turn, and returns itself from the graveyard", () => {
    const { game } = table();
    const devotee = spawn(game, "Abzan Devotee");
    lands(game, "Wastes", 2);
    activate(game, devotee, 0);
    expect(() => activate(game, devotee, 0)).toThrow();
    const dead = toGraveyard(game, "Abzan Devotee");
    lands(game, "Swamp", 3);
    activate(game, dead, 1);
    expect(zone(game, dead)).toBe("hand");
  });
});

describe("Dragonstorm Forecaster", () => {
  it("searches only for Dragonstorm Globe or Boulderborn Dragon", () => {
    const { game, a } = table();
    const globe = toLibrary(game, "Dragonstorm Globe");
    const dragon = toLibrary(game, "Boulderborn Dragon");
    const bears = toLibrary(game, "Grizzly Bears");
    const forecaster = spawn(game, "Dragonstorm Forecaster");
    lands(game, "Wastes", 2);
    const seen = pickFromZone(a, dragon);
    activate(game, forecaster);
    expect([...seen.offered].sort()).toEqual([globe, dragon].sort());
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, dragon)).toBe("hand");
  });
});

describe("Attuned Hunter", () => {
  it("gets one counter per batch of cards leaving your graveyard during your turn, none on an opponent's", () => {
    const { game } = table();
    const hunter = spawn(game, "Attuned Hunter");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    expect(graveyard(game).length).toBe(0);
    expect(counters(game, hunter)).toBe(1);

    nextTurn(game);
    toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, hunter)).toBe(1);
  });
});

describe("Endure on entering", () => {
  const cases: readonly [string, number, string][] = [
    ["Dusyut Earthcarver", 3, SPIRIT_3],
    ["Sandskitter Outrider", 2, SPIRIT_2],
    ["Kin-Tree Nurturer", 1, SPIRIT_1],
    ["Inspirited Vanguard", 2, SPIRIT_2],
  ];
  for (const [name, n, token] of cases) {
    it(`${name} endures ${n}: counters, or an ${n}/${n} white Spirit`, () => {
      const { game, a } = table();
      pickModes(a, 0);
      const first = enter(game, name);
      expect(counters(game, first)).toBe(n);
      pickModes(a, 1);
      const second = enter(game, name);
      expect(counters(game, second)).toBe(0);
      const [spirit] = named(game, token);
      expect(pt(game, spirit)).toEqual({ power: n, toughness: n });
    });
  }

  it("Inspirited Vanguard endures 2 again whenever it attacks", () => {
    const { game, a } = table();
    const vanguard = spawn(game, "Inspirited Vanguard");
    pickModes(a, 0);
    attack(game, a, [vanguard]);
    expect(counters(game, vanguard)).toBe(2);
    expect(life(game, B)).toBe(15);
  });

  it("Dusyut Earthcarver has reach; Sandskitter Outrider menace; Kin-Tree Nurturer lifelink", () => {
    const { game } = table();
    expect(keywords(game, spawn(game, "Dusyut Earthcarver")).has("reach")).toBe(true);
    expect(keywords(game, spawn(game, "Sandskitter Outrider")).has("menace")).toBe(true);
    expect(keywords(game, spawn(game, "Kin-Tree Nurturer")).has("lifelink")).toBe(true);
  });
});

describe("Dragonbroods' Relic", () => {
  it("taps with another creature for one mana of any color", () => {
    const { game } = table();
    const relic = spawn(game, "Dragonbroods' Relic");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, relic, 0);
    expect(game.state.objects[relic].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("sacrifices for Reliquary Dragon, a 4/4 all-colors flier with lifelink that deals 3 damage as it enters", () => {
    const { game, a } = table();
    const relic = spawn(game, "Dragonbroods' Relic");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    lands(game, "Wastes", 3);
    pickTargets(a, B);
    activate(game, relic, 1);
    expect(zone(game, relic)).toBe("graveyard");
    const [dragon] = named(game, "Reliquary Dragon");
    expect(game.state.objects[dragon].isToken).toBe(true);
    expect(pt(game, dragon)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
    expect(keywords(game, dragon).has("lifelink")).toBe(true);
    expect(life(game, B)).toBe(17);
  });
});

describe("Sagu Pummeler", () => {
  it("renew: exiles itself from the graveyard for two +1/+1 counters and a reach counter", () => {
    const { game } = table();
    const pummeler = toGraveyard(game, "Sagu Pummeler");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    activate(game, pummeler, 0, { targets: [ref(bears)] });
    expect(zone(game, pummeler)).toBe("exile");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, bears, "reach")).toBe(1);
    expect(keywords(game, bears).has("reach")).toBe(true);
  });
});

describe("Kishla Trawlers", () => {
  it("exiling a creature card from your graveyard returns an instant or sorcery card", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = pickFromZone(a, bears);
    enter(game, "Kishla Trawlers");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("exiling nothing returns nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickFromZone(a);
    enter(game, "Kishla Trawlers");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Riverwheel Sweep", () => {
  it("taps a creature with three stun counters, then exiles two and lets you play the chosen one", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const bolt = toLibrary(game, "Lightning Bolt");
    const other = toLibrary(game, "Grizzly Bears");
    spawn(game, "Island");
    spawn(game, "Mountain");
    spawn(game, "Plains");
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Riverwheel Sweep"), { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(3);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, other)).toBe("exile");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Forest");
    expect(() => cast(game, other, { via: "impulse" })).toThrow();
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });
});
