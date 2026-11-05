// Batch 260, group B: cards freed by the built need-key families.
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
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
  types,
  zone,
} from "./harness.js";

const showing = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => printedCardName(game.state.objects[id]) === name);

describe("Silence the Believers", () => {
  it("exiles each target creature and the Auras attached to it, and only those", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Goblin Piker", B);
    const aura = spawn(game, "Pacifism", A);
    game.state.objects[aura].attachedTo = bear;
    const spell = toHand(game, "Silence the Believers");
    cast(game, spell, { targets: [ref(bear), ref(giant)] });
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, aura)).toBe("exile");
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Defiant Vanguard", () => {
  it("at end of combat destroys itself and the creature it blocked", () => {
    const { game, a, b } = table();
    const vanguard = spawn(game, "Defiant Vanguard", B);
    const giant = spawn(game, "Hill Giant", A);
    b.declareBlockersFn = () => [{ blocker: vanguard, attacker: giant }];
    game.state.objects[vanguard].counters["+1/+1"] = 5; // survives the damage
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, vanguard)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Spitting Slug", () => {
  it("unpaid, the creature it blocks gains first strike", () => {
    const { game, a, b } = table();
    const slug = spawn(game, "Spitting Slug", B);
    const bear = spawn(game, "Hill Giant", A);
    const bystander = spawn(game, "Goblin Piker", A);
    b.declareBlockersFn = () => [{ blocker: slug, attacker: bear }];
    pickModes(b);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "postcombat-main");
    expect(keywords(game, bear).has("first-strike")).toBe(true);
    expect(keywords(game, slug).has("first-strike")).toBe(false);
    expect(keywords(game, bystander).has("first-strike")).toBe(false);
  });
});

describe("Mangara's Equity and Circle of Affliction", () => {
  it("Mangara's Equity hits back a creature of the chosen colour that damaged you", () => {
    const { game } = table();
    const equity = spawn(game, "Mangara's Equity");
    game.state.objects[equity].chosenOnEnter = "R";
    const pyro = spawn(game, "Prodigal Pyromancer");
    activate(game, pyro, 0, { targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(zone(game, pyro)).toBe("graveyard");
  });

  it("Mangara's Equity ignores a colour it didn't choose", () => {
    const { game } = table();
    const equity = spawn(game, "Mangara's Equity");
    game.state.objects[equity].chosenOnEnter = "B";
    const pyro = spawn(game, "Prodigal Pyromancer");
    activate(game, pyro, 0, { targets: [ref(A)] });
    expect(zone(game, pyro)).toBe("battlefield");
  });

  it("Circle of Affliction drains when a source of the chosen colour damages you and you pay", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Affliction");
    game.state.objects[circle].chosenOnEnter = "R";
    lands(game, "Wastes", 1);
    const pyro = spawn(game, "Prodigal Pyromancer");
    pickModes(a, 0);
    pickTargets(a, B);
    activate(game, pyro, 0, { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
  });
});

describe("Psychic Allergy", () => {
  it("deals the opponent damage equal to their nontoken permanents of the chosen colour", () => {
    const { game } = table();
    const allergy = spawn(game, "Psychic Allergy");
    game.state.objects[allergy].chosenOnEnter = "G";
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", A);
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Spirit-Sister's Call", () => {
  it("sacrificing a permanent that shares a card type returns the chosen card", () => {
    const { game, a } = table();
    spawn(game, "Spirit-Sister's Call");
    const fodder = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(a, giant);
    pickModes(a, 0);
    pickPermanents(a, fodder);
    toStep(game, "end");
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a permanent sharing no card type can't be sacrificed for it", () => {
    const { game, a } = table();
    spawn(game, "Spirit-Sister's Call");
    const land = spawn(game, "Forest");
    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(a, giant);
    pickModes(a, 0);
    pickPermanents(a, land);
    toStep(game, "end");
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Raise the Draugr", () => {
  it("mode two refuses two creature cards that share no creature type", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bear = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const spell = toHand(game, "Raise the Draugr");
    expect(() => cast(game, spell, { modes: [1], targets: [ref(bear), ref(giant)] })).toThrow();
  });

  it("mode two returns two that share one", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bear = toGraveyard(game, "Grizzly Bears");
    const bear2 = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Raise the Draugr");
    cast(game, spell, { modes: [1], targets: [ref(bear), ref(bear2)] });
    expect(hand(game)).toEqual(expect.arrayContaining([bear, bear2]));
  });
});

describe("face down", () => {
  it("Obscuring Aether turns itself into a face-down 2/2 creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const aether = spawn(game, "Obscuring Aether");
    activate(game, aether, 0);
    expect(game.state.objects[aether].faceDown).toBeDefined();
    expect(types(game, aether)).toEqual(["creature"]);
    expect(pt(game, aether)).toEqual({ power: 2, toughness: 2 });
  });

  it("Cybership puts the top two cards of the damaged player's library onto the battlefield as Cybermen", () => {
    const { game, a } = table();
    const ship = spawn(game, "Cybership");
    const top1 = toLibrary(game, "Hill Giant", B);
    const top2 = toLibrary(game, "Grizzly Bears", B);
    // Crewed by hand: make it a creature this turn.
    const crew = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    pickPermanents(a, ...crew);
    activate(game, ship, 0);
    a.declareAttackersFn = () => [{ attacker: ship, defender: B }];
    pickFromZone(a, top1, top2);
    toStep(game, "postcombat-main");
    for (const id of [top1, top2]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(A);
      expect(game.state.objects[id].faceDown?.as).toBe("2/2 Cyberman artifact creature");
    }
  });

  it("The Cyber-Controller puts the creature cards it milled onto the battlefield face down", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 3);
    const land = toLibrary(game, "Forest", B);
    const giant = toLibrary(game, "Hill Giant", B);
    const card = toHand(game, "The Cyber-Controller");
    cast(game, card, { x: 2 });
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].faceDown?.as).toBe("2/2 Cyberman artifact creature");
  });

  it("Death in Heaven's third chapter puts every creature card exiled with it onto the battlefield face down", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = toGraveyard(game, "Hill Giant", B);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    const forest = toGraveyard(game, "Forest", B);
    pickTargets(a, B);
    cast(game, toHand(game, "Death in Heaven"));
    for (const id of [giant, bear, forest]) expect(zone(game, id)).toBe("exile");
    toStep(game, "precombat-main");
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, forest)).toBe("exile");
    expect(game.state.objects[giant].faceDown?.as).toBe("2/2 Cyberman artifact creature");
  });
});

describe("meld", () => {
  it("Titania, Voice of Gaea melds with Argoth at upkeep only with four lands in the graveyard", () => {
    const { game } = table();
    spawn(game, "Titania, Voice of Gaea");
    spawn(game, "Argoth, Sanctum of Nature");
    lands(game, "Wastes", 2);
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Forest");
    toStep(game, "upkeep");
    settle(game);
    expect(showing(game, "Titania, Gaea Incarnate")).toHaveLength(0);
    toGraveyard(game, "Forest");
    toStep(game, "upkeep");
    settle(game);
    const [titania] = showing(game, "Titania, Gaea Incarnate");
    expect(titania).toBeDefined();
    // Its enters ability returned the four lands; it counts its lands.
    expect(graveyard(game).length).toBe(0);
    expect(pt(game, titania)).toEqual({ power: 6, toughness: 6 });
  });

  it("Vanille melds with Fang into Ragnarok when its controller pays", () => {
    const { game, a } = table();
    spawn(game, "Vanille, Cheerful l'Cie");
    spawn(game, "Fang, Fearless l'Cie");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 4);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    const [ragnarok] = showing(game, "Ragnarok, Divine Deliverance");
    expect(ragnarok).toBeDefined();
    expect(keywords(game, ragnarok).has("menace")).toBe(true);
  });
});

describe("Kami of Transience", () => {
  it("returns from the graveyard at end step after an enchantment you owned went there from the battlefield", () => {
    const { game, a } = table();
    const kami = toGraveyard(game, "Kami of Transience");
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, kami)).toBe("graveyard");
    toStep(game, "precombat-main");
    const aether = spawn(game, "Obscuring Aether");
    destroy(game, aether);
    toStep(game, "end");
    settle(game);
    expect(zone(game, kami)).toBe("hand");
  });
});

describe("blocking relations and attachments", () => {
  it("Alms Beast gives the creature blocking it lifelink, not a bystander", () => {
    const { game, a, b } = table();
    const beast = spawn(game, "Alms Beast");
    const giant = spawn(game, "Hill Giant", B);
    const bystander = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: beast }];
    a.declareAttackersFn = () => [{ attacker: beast, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(23);
    expect(keywords(game, bystander).has("lifelink")).toBe(false);
  });

  it("Fulgent Distraction taps both creatures and unattaches their Equipment", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const sword = spawn(game, "Bonesplitter", B);
    game.state.objects[sword].attachedTo = giant;
    cast(game, toHand(game, "Fulgent Distraction"), { targets: [ref(bear), ref(giant)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[sword].attachedTo).toBeNull();
    expect(zone(game, sword)).toBe("battlefield");
  });

  it("Retraced Image puts a card with a permanent's name onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    spawn(game, "Grizzly Bears", B);
    const bear = toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, bear);
    cast(game, toHand(game, "Retraced Image"));
    expect(seen.offered).toContain(bear);
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Missy", () => {
  it("returns another dying nonartifact creature face down and tapped as a Cyberman under your control", () => {
    const { game } = table();
    spawn(game, "Missy");
    const bear = spawn(game, "Grizzly Bears", B);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].controller).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[bear].faceDown?.as).toBe("2/2 Cyberman artifact creature");
  });

  it("an opponent choosing the damage takes 1 from each artifact creature you control", () => {
    const { game, b } = table();
    spawn(game, "Missy");
    spawn(game, "Cybership");
    spawn(game, "The Cyber-Controller");
    pickModes(b, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});

describe("Anzrag's Rampage", () => {
  it("exiles as many cards as artifacts went to graveyards from the battlefield, and may put a creature onto the battlefield with haste", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Bonesplitter", B);
    spawn(game, "Bonesplitter", B);
    const mine = spawn(game, "Bonesplitter", A);
    const second = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Forest");
    pickFromZone(a, giant);
    cast(game, toHand(game, "Anzrag's Rampage"));
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant).has("haste")).toBe(true);
    // X is 2: the top two (the Forest and the Giant), not the third.
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("library");
  });
});

describe("Turtle Van", () => {
  it("doubles the counters on a crewing Turtle", () => {
    const { game, a } = table();
    const van = spawn(game, "Turtle Van");
    const crewer = spawn(game, "Grizzly Bears");
    pickPermanents(a, crewer);
    activate(game, van, 0);
    expect(game.state.objects[crewer].tapped).toBe(true);
    pickTargets(a, crewer);
    a.declareAttackersFn = () => [{ attacker: van, defender: B }];
    toStep(game, "postcombat-main");
    expect(counters(game, crewer)).toBe(1);
  });
});
